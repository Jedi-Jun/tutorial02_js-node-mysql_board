const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { ObjectId } = require('bson');

app.use(bodyParser.urlencoded({ extended: false }));

const connection = require('mongodb').MongoClient;
// "mongodb+srv://<user>:<password>@<cluster-url>?w=majority"
const uri = 'mongodb://jun:1234@localhost:27017/';
let db;
connection.connect(uri, (error, database) => {
    if(error) throw error;
    db = database.db('nodejs'); //db(database's name")
});

const makeList = (data) => {
    let list = '';
    for(let i = 0; i < data.length; i++) {
        list = list + `
            <li>${data[i].description}, ${data[i].create_at}</li>
            <input type="button" value="update" />
            <form action="/process_delete" method="post">
                <input type="hidden" name="id" value=${data[i]._id} />
                <input type="submit" value="X" />
            </form>
            `
    }
    return `<ol>${list}</ol>`;
}

const templateHTML = (list) => {
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
            <input type="text" name="msg" autocomplete="off" />
            <input type="submit" />
        </form>
        ${list}
    </body>
    </html>
    `;
}

app.get('/', (req, res) => {
    db.collection('todo').find().toArray((error, docs) => {
        const list = makeList(docs);
        res.send(templateHTML(list));
    });
});

app.post('/process_create', (req, res) => {
    db.collection('todo').insert({description: req.body.msg, "create_at": new Date()});
    res.redirect('/');
});

app.post('/process_delete', (req, res) => {
    console.log(req.body.id)
    db.collection('todo').deleteOne({_id: ObjectId(req.body.id)});
    res.redirect('/');

});

app.listen(3000, () => 'server is running...');