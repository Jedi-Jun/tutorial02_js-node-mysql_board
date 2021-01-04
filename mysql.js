const mysql = require('mysql'); // require: commonJS from Node.js
// import mysql from 'mysql';  // import: ES6

class Mysql {
    connection = mysql.createConnection({
        host      :  'localhost',
        user      :  'root',
        password  :  '1234',
        database  :  'opentutorials'
    });
    /*
    connection.connect();

    connection.query('SELECT * From topic', function(error, results, fields) {
        if(error) throw error;
        console.log(results)
    });

    connection.end();
    */
}

// exports.Mysql = Mysql;
module.exports = Mysql;