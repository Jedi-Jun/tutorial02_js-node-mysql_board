const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

const courses = [
    { id: 1, name: 'course1'},
    { id: 2, name: 'course2'},
    { id: 3, name: 'course3'},
];

app.get('/', (req, res) => {
    res.send('Express n Postman');
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

app.post('/api/courses', (req, res) => {
    console.log(req.body);
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) res.status(404).send(`id: ${req.params.id} hasn't been found.`);
    courses[0].name = req.body.name;
    res.send(courses);
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) res.status(404).send(`id: ${req.params.id} hasn't been found.`);
    const index = courses.indexOf(course)
    courses.splice(index, 1);
    res.send(courses);
});

// app.get('/api/courses/:id', (req, res) => {
//     const course = courses.find(c => c.id === parseInt(req.params.id));
//     if(!course) res.status(404).send(`id: ${req.params.id} hasn't been found.`);
//     res.send(course);
//     res.send(req.query);    // ?apple=red&banana=yellow
// });

app.listen(3000, () => {
    console.log('Server is running on Port 3000');
});