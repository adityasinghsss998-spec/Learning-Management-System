const dotenv = require('dotenv');
const {start}=require('./consumer/enrollment-consumer')
const express = require('express');
const app = express();
const port = process.env.PORT || 3009; // Or whatever port you like

// 1. Give Render an endpoint to ping so it knows the service is alive
app.get('/health', (req, res) => {
    res.status(200).send('Notification consumer is active');
});

app.listen(port, () => {
    console.log(`Dummy server listening on port ${port} to bypass Render free tier checks`);
});
dotenv.config();

start().catch((e) => {
    console.log("Failed to start notification service", e);
    process.exit(1);
});