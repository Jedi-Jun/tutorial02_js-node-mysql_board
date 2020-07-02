var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var Mysql = require('./mysql');

class Sql extends Mysql {} 
const sql = new Sql();
// sql.connection.end();
sql.connection.connect();

function templateHTML(title, list){
  return `
    <!DOCTYPE html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WEB - ${title}</title>
    </head>
    <body>
      <h2><a href="/">WEB</a></h2>
      ${list}
      <button>CREATE</button>
      <button>UPDATE</button>
      <button>DELETE</button>
      <h3>${title}</h3>
      <p>the word of welcome is to greet to somebody..</p>
    </body>
    </html>
  `
}
function templateList(results){
  var i = 0;
  var body = '';
  while(i < results.length){
    var list = `<li><a href="/?id=${results[i].id}">${results[i].title}</a></li>`;
    body += list;  
    i++;      
  }
  var list = `<ol>${body}</ol>`
  return list;
}

var server = http.createServer(function(request, response){
  var _url = request.url;
  var pathname = url.parse(_url, true).pathname;
  var id = url.parse(_url, true).query.id - 1;
  if(pathname === '/'){
    sql.connection.query(
    'SELECT * FROM topic', function(err, results, fields){
      if(err) {
        console.log('SELECT_ERROR');
      }
      if(id >= 0){
        var title = results[id].title;
        
      } else {
        var title = 'Welcome!';
      }
      var list = templateList(results);
      response.writeHead(200);
      response.end(templateHTML(title, list));
      // sql.connection.end();
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
server.listen(8080);