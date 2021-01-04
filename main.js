const http = require('http');
const url = require('url');
const qs = require('querystring');
const Mysql = require('./mysql');
const PORT = 8080;

class Sql extends Mysql {}
const sql = new Sql();
sql.connection.connect();
// sql.connection.end();

function templateHTML(title, list, control, body) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WEB2 - ${title}</title>
        </head>
        <body>
            <h2><a href="/">WEB</a></h2>
            ${list}
            ${control}
            <!--
            <button onclick="location.href='./create'">CREATE</button>
            <button onclick="location.href='./update'">UPDATE</button>
            <button onclick="location.href='./delete_process'">DELETE</button>
            -->
            ${body}
        </body>
        </html>
    `;
}

function templateList(topics) {
    let i = 0;
    let body = '';
    while(i < topics.length) {
        let list = `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
        body += list;
        i++;
    }
    let list = `<ol>${body}</ol>`
    return list;
}

const server = http.createServer(function(request, response) {
    let _url = request.url;
    let pathname = url.parse(_url, true).pathname;
    let queryData = url.parse(_url, true).query;

    if(pathname === '/') {
    sql.connection.query(
    'SELECT * FROM topic', function(error, topics) {
        if(error) throw error;
        if(queryData.id === undefined) {
            let title = 'Welcome!';
            let description = 'Choose one of the list above :-)'
            let list = templateList(topics);
            response.writeHead(200);
            response.end(templateHTML(title, list,
                `<button onclick="location.href='./create'">CREATE</button>
                <button onclick="location.href='./update'">UPDATE</button>
                <button onclick="location.href='./delete_process'">DELETE</button>`,
                `<p>${description}</p>`
            ));
        } else {
            sql.connection.query(
                'SELECT * FROM topic WHERE id=?',[queryData.id], function(error, topic) {
                    if(error) throw error;
                    let title = topic[0].title;
                    let description = topic[0].description;
                    let list = templateList(topics);
                    response.writeHead(200);
                    response.end(templateHTML(title, list,
                        `<button onclick="location.href='./create'">CREATE</button>
                        <button onclick="location.href='./update'">UPDATE</button>
                        <button onclick="location.href='./delete_process'">DELETE</button>`,
                        `<p>${description}</p>`
                    ));
            });
        }
    });
    } else if(pathname === '/create') {
    sql.connection.query('SELECT * FROM topic', function(error, topics) {
        if(error) throw error;
        let title = 'create';
        let list = templateList(topics);
        response.end(templateHTML(title, list, '',
            `<p>
                <form action="/process_create" method="post">
                    <input type="hidden" name="id" value=" " />
                    <label for="txtbox">Title: </label>
                    <input type="text" id="txtbox" name="title"/>
                    <br />
                    <label for="txtarea">Description: </label>
                    <textarea id="txtarea" name="description"></textarea>
                    <br />
                    <input type="submit" value="Submit" />
                </form>
            </p>`
        ));
    });
    } else if(pathname === '/process_create') {
        let body = '';
        request.on('data', function(data) {
          body += data;
        });
        request.on('end', function() {
            let post = qs.parse(body);
            let title = post.title;
            let description = post.description;
            sql.connection.query(
              `INSERT INTO topic(title, description, created, author_id)
              VALUES('${title}', '${description}', current_timestamp(), null)`, function(error, results) {
                  if(error) throw error;
                  console.log(results)
                  response.writeHead(302, {Location: `/?id=${results.insertId}`});
                  response.end();
            });
        });
    } else if(pathname === '/update') {
        console.log('update')
    } else if(pathname === '/process_update') {
        console.log('process_update')
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});

server.listen(PORT);