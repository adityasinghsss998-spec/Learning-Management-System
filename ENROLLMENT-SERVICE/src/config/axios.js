const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const courseClient = axios.create({
    baseURL: process.env.COURSE_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
});

module.exports = { courseClient };