const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const {authMiddleware}=require('./middleware/auth-middleware');

dotenv.config();

const app = express();
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many auth attempts, please try again later" },
});
app.use(globalLimiter);
app.use('/api/v1/auth', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
}));

app.use('/api/v1/users', authMiddleware, createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
}));

app.use('/api/v1/courses', authMiddleware, createProxyMiddleware({
    target: process.env.COURSE_SERVICE_URL,
    changeOrigin: true,
}));

app.use('/api/v1/enrollments', authMiddleware, createProxyMiddleware({
    target: process.env.ENROLLMENT_SERVICE_URL,
    changeOrigin: true,
}));

app.use('/api/v1/live', authMiddleware, createProxyMiddleware({
    target: process.env.LIVE_SERVICE_URL,
    changeOrigin: true,
    ws: true,
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("API Gateway Running");
});