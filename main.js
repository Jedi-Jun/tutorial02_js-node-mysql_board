var http = require('http');
var url = require('url');
var qs = require('querystring');
var Mysql = require('./mysql');
const { ERANGE, ENGINE_METHOD_DSA } = require('constants');

class Sql extends Mysql {} 
const sql = new Sql();
// sql.connection.end();
sql.connection.connect();

function templateHTML(title, list, control, body){
  return `
    <!DOCTYPE html>
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
      <button>UPDATE</button>
      <button>DELETE</button>
      -->
      ${body}
      <!--
      <h3>$title</h3>
      <p>$description</p>
      -->
    </body>
    </html>
  `;
}
function templateList(topics){
  var i = 0;
  var body = '';
  while(i < topics.length){
    var list = `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
    body += list;  
    i++;      
  }
  var list = `<ol>${body}</ol>`
  return list;
}

var server = http.createServer(function(request, response){
  var _url = request.url;
  var pathname = url.parse(_url, true).pathname;
  var queryData = url.parse(_url, true).query;
  if(pathname === '/'){
    sql.connection.query(
    'SELECT * FROM topic', function(error, topics){
      if(error) throw error;
      if(queryData.id === undefined){
        var title = 'Welcome!';
        var description = 'Choose one of the list above :-)'
        var list = templateList(topics);
        response.writeHead(200);
        response.end(templateHTML(title, list, 
          `<button onclick="location.href='./create'">CREATE</button>
          <button>UPDATE</button>
          <button>DELETE</button>`,
          `<p>${description}</p>`));
      } else {
        sql.connection.query(
          'SELECT * FROM topic WHERE id=?',[queryData.id], function(error, topic){
            if(error) throw error;
            var title = topic[0].title;
            var description = topic[0].description;
            var list = templateList(topics);
            response.writeHead(200);
            response.end(templateHTML(title, list, 
              `<button onclick="location.href='./create'">CREATE</button>
              <button>UPDATE</button>
              <button>DELETE</button>`,
              `<p>${description}</p>`));
        });
      }
      
    });
  } else if(pathname === '/create'){
    sql.connection.query('SELECT * FROM topic', function(error, topics){
      if(error) throw error;
      var title = 'create';
      var list = templateList(topics);
      response.end(templateHTML(title, list, '',
      `
      <p>
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
      </p>
      `));
    });
  } else if(pathname === '/process_create'){
    var body = '';
    request.on('data', function(data){
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      // var id = post.id;
      var title = post.title;
      var description = post.description;
      sql.connection.query(
        `INSERT INTO topic(title, description, created, author_id)
        VALUES('${title}', '${description}', current_timestamp(), null)`, function(error, results){
          if(error) throw error;
          console.log(results)
          response.writeHead(302, {Location: `/?id=${results.insertId}`});
          response.end();
        });
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
server.listen(8080);