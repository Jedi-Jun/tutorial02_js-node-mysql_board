var mysql = require('mysql');

class Mysql{
    connection = mysql.createConnection({
        host      :  'localhost',
        user      :  'root',
        password  :  '1234',
        database  :  'opentutorials'
    });
    /*
    connection.connect();
    connection.query('SELECT * From topic', function(err, results, fields) {
        if(err) {
            console.log(error);
        }
        console.log(results)
    });
    connection.end();
    */
}
module.exports = Mysql;