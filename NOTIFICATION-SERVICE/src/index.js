const dotenv = require('dotenv');
const { start } = require('./consumers/enrollment-consumer');

dotenv.config();

start().catch((e) => {
    console.log("Failed to start notification service", e);
    process.exit(1);
});