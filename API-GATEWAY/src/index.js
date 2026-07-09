const express = require('express');
const http = require('http');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const {authMiddleware,optionalAuthMiddleware} = require('./middleware/auth-middleware')

dotenv.config();

const app = express();
const server = http.createServer(app);

const x = [
    "https://learning-management-system-frontend-wheat.vercel.app",
    "http://localhost:5173"
];

app.use(cors({
    origin: function (a, b) {
        if (!a || x.indexOf(a) !== -1 || a.endsWith(".vercel.app")) {
            b(null, true);
        } else {
            b(new Error("CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true
}));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skipSuccessfulRequests: true,
    message: { message: "Too many auth attempts, please try again later" },
});

app.use(globalLimiter);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        services: {
            auth: process.env.AUTH_SERVICE_URL,
            user: process.env.USER_SERVICE_URL,
            course: process.env.COURSE_SERVICE_URL,
            enrollment: process.env.ENROLLMENT_SERVICE_URL,
            live: process.env.LIVE_SERVICE_URL,
        },
    });
});

app.use('/api/v1/auth', authLimiter, createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    on: {
        error: (err, req, res) => {
            res.status(503).json({ message: "Auth service unavailable" });
        },
    },
}));

app.use('/api/v1/users', authMiddleware, createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    on: {
        error: (err, req, res) => {
            res.status(503).json({ message: "User service unavailable" });
        },
    },
})); 

app.use('/api/v1/courses', optionalAuthMiddleware, createProxyMiddleware({
    target: process.env.COURSE_SERVICE_URL,
    changeOrigin: true,
    on: {
        error: (err, req, res) => {
            res.status(503).json({ message: "Course service unavailable" });
        },
    },
}));

app.use('/api/v1/enrollments', authMiddleware, createProxyMiddleware({
    target: process.env.ENROLLMENT_SERVICE_URL,
    changeOrigin: true,
    on: {
        error: (err, req, res) => {
            res.status(503).json({ message: "Enrollment service unavailable" });
        },
    },
}));

app.use('/api/v1/live', authMiddleware, createProxyMiddleware({
    target: process.env.LIVE_SERVICE_URL,
    changeOrigin: true,
    ws: true,
    on: {
        error: (err, req, res) => {
            if (res && res.status) {
                res.status(503).json({ message: "Live service unavailable" });
            }
        },
    },
}));

app.use('/api/v1/ai', authMiddleware, createProxyMiddleware({
    target: process.env.AI_SERVICE_URL,
    changeOrigin: true,
    on: {
        error: (err, req, res) => {
            res.status(503).json({ message: "AI service unavailable" });
        },
    },
}));

server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/api/v1/live')) {
        const proxy = createProxyMiddleware({
            target: process.env.LIVE_SERVICE_URL,
            changeOrigin: true,
            ws: true,
        });
        proxy.upgrade(req, socket, head);
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
