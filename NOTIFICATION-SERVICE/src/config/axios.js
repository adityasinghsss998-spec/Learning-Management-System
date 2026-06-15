const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const enrollmentClient = axios.create({
    baseURL: process.env.ENROLLMENT_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
});

module.exports = { enrollmentClient };