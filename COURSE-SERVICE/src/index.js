const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const routes = require('./routes/v1/index');

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

app.use('/', routes);

const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log("Course Service Running");
});