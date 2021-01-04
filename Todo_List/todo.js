const http = require('http');
const url = require('url');
const mysql = require('mysql');
const qs = require('querystring');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'todo'
});

connection.connect(() => {
    console.log('MYSQL HAS BEEN CONNECTED!!')
});

function makeList(data) {
    let list = '';
    for(let i = 0; i < data.length; i++) {
        list = list + `
            <li id="listId-${data[i].id}">${data[i].description}, ${data[i].create_at}</li>
            <input type="button" value="update" />
            <form action="/process_delete" method="post">
                <input type="hidden" name="id" value=${data[i].id} />
                <input type="submit" value="X" />
            </form>
            `
    }
    return `<ol>${list}</ol>`;
}

function templateHTML(list) {
    return `
    <!DOCTYPE html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jun</title>
    </head>
    <body>
        <h1><a href="/">To Do "List"</a></h1>
        <form action="/process_create" method="post">
            <input name="msg" type="text" />
            <input type="submit" />
        </form>
        ${list}
    </body>
    </html>
    `;
}

const server = http.createServer((req,res) => {
    const _url = req.url;
    const pathName = url.parse(_url, true).pathname
    console.log('SERVER IS READY');

    if(pathName === '/') {
        connection.query(
            `SELECT * from todo_list ORDER BY id ASC`, (error, results, fields) => {
                let list = makeList(results);
                res.writeHead(200, { 'Context-Type': 'text/html' });
                if(error) {
                    throw error;
                } else if (results.length === 0) {
                    connection.query(`ALTER TABLE todo_list AUTO_INCREMENT = 0;`);
                    res.end(templateHTML(list));
                } else {
                    res.end(templateHTML(list));
                }
        });
    } else if(pathName === '/process_create') {
        let body = '';
        req.on('data', data => {
            // data: <Buffer 6d 73 67 3d 61> (from msg=a)
            body += data;
        }).on('end', () => {
            console.log("activation of INSERT INTO");
            let message = qs.parse(body).msg;
            connection.query(
                `INSERT INTO todo_list(description, check_box, create_at)
                VALUES('${message}', null, now())`,
                (error, results, fields) => {
                    if(error) throw error;
                    res.writeHead(302, {Location: `/`});
                    res.end();
            });
        });
    } else if(pathName === '/process_delete') {
        let body = '';
        req.on('data', data => {
            body += data;
        }).on('end', () => {
            let id = qs.parse(body).id;
            connection.query(
                `DELETE FROM todo_list WHERE todo_list.id = ${id}`,
                (error, results, fields) => {
                    if(error) throw error;
                    res.writeHead(302, {Location: `/`});
                    res.end();
            });
        });
    }
});

server.listen(3000);