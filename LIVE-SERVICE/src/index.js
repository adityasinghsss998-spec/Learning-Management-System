const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const { init } = require('./socket/liveSocket');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'live-service running' });
});

init(server);

const port = process.env.PORT || 3006;
server.listen(port, () => {
    console.log(`Live service running on port ${port}`);
});