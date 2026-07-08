const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const routes = require('./routes/v1/index');

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ai-service running' });
});

const port = process.env.PORT || 3007;
app.listen(port, () => {
    console.log(`AI Service running on port ${port}`);
});