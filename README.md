> 🚧 **Currently under active development** — Backend microservices are being built service by service. Frontend and AI integration coming soon.

---

# LMS Platform — Full Stack Learning Management System

A production-grade, full-stack Learning Management System built from scratch using a **Polyrepo Microservices Architecture**. Every service is completely isolated, runs on its own port, and connects to its own database. The system uses a mix of synchronous HTTP, asynchronous event-driven messaging, and real-time WebSocket communication.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Tech Stack](#tech-stack)
- [Communication Patterns](#communication-patterns)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Payment Flow](#payment-flow)
- [Real-Time Features](#real-time-features)
- [Future Plans](#future-plans)
- [Project Status](#project-status)

---

## Overview

This platform allows **instructors** to create and publish courses with structured sections and lessons, upload video and PDF content directly to AWS S3, and manage their course catalog. **Students** can browse the catalog, enroll in free or paid courses, track their progress lesson by lesson, participate in live doubt sessions, and receive certificates on completion — all through a single API gateway entry point.

The project is being built with a focus on real-world engineering patterns — not just making things work, but making them work the right way at scale.

---

## Architecture

```
Client (React + Vite)
        │
        ▼
┌─────────────────────┐
│     API Gateway     │  ← Single entry point (Port 3000)
│  JWT Auth + Proxy   │  ← Rate limiting, centralized auth
│  + Rate Limiting    │
└──────────┬──────────┘
           │
    ┌──────┼────────────────────────────┐
    │      │                            │
    ▼      ▼                            ▼
auth   user-service            course-service
service   (3002)                   (3003)
(3001)  MongoDB                  MongoDB + S3
MongoDB
           │                            │
           │         ┌──────────────────┘
           │         │
           ▼         ▼
    enrollment-service (3004)
         MongoDB + Razorpay
           │
    ┌──────┴──────────┐
    │                 │
    ▼                 ▼
RabbitMQ          course-service
(async events)    (Axios HTTP)
    │
    ▼
notification-service (3005)
    Nodemailer + DLQ
           │
           ▼
    enrollment-service
    (certificate writeback)

live-service (3006)
Socket.io + Redis Pub/Sub
```

---

## Services

### `api-gateway` — Port 3000
Single entry point for all client requests. Verifies JWT tokens centrally and injects user identity headers (`x-user-id`, `x-user-role`, `x-user-name`, `x-user-email`) into every proxied request. Applies global and auth-specific rate limiting. No business logic lives here.

### `auth-service` — Port 3001
The only service that handles passwords and token issuance. Implements a full access + refresh token flow. Access tokens expire in 15 minutes, refresh tokens in 7 days and are stored hashed in the database. Provides register, login, refresh, and logout endpoints.

### `user-service` — Port 3002
Manages student and instructor profiles independently from auth. Handles bio, avatar (uploaded to S3), and social links. Profiles are auto-created on first access — no separate onboarding step required.

### `course-service` — Port 3003
The content backbone of the platform. Instructors create courses with a two-level hierarchy — Sections contain Lessons. Lesson content (video, PDF) is streamed directly to AWS S3 via `multer-s3`. Supports full-text search via MongoDB text indexes, filtering by category, level, and price range, and sorting by newest or popularity. Every mutation is protected by an instructor ownership guard.

### `enrollment-service` — Port 3004
The most interconnected service. Handles the full student-course lifecycle — checkout, payment verification via Razorpay, enrollment, lesson-by-lesson progress tracking, and course completion detection. Uses Axios to communicate synchronously with `course-service` and RabbitMQ to fire async events to `notification-service`.

### `notification-service` — Port 3005
A pure RabbitMQ consumer with no HTTP server, no database, and no routes. Listens on two queues — `enrollment.created` for welcome emails and `certificate.generate` for completion emails. Failed messages are routed to Dead Letter Queues instead of being lost. On certificate generation it writes the certificate URL back to `enrollment-service` via Axios.

### `live-service` — Port 3006
Real-time bidirectional communication for live doubt sessions between students and instructors. Uses Socket.io with Redis Pub/Sub as the message broker so the system scales horizontally across multiple instances. Tracks room presence — who is online in each session — using Redis Sets.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server for each microservice |
| MongoDB + Mongoose | Primary database with schema validation and document methods |
| Redis + ioredis | Real-time pub/sub and presence tracking in live-service |
| RabbitMQ + amqplib | Async event-driven communication between services |
| Socket.io | Real-time bidirectional WebSocket communication |
| Axios | Synchronous HTTP communication between services |
| JWT (jsonwebtoken) | Stateless authentication via access + refresh token pair |
| bcrypt | Password hashing |
| AWS S3 + @aws-sdk/client-s3 | Cloud storage for course content and avatars |
| multer + multer-s3 | Multipart file upload streamed directly to S3 |
| Razorpay | Payment processing with HMAC-SHA256 signature verification |
| nodemailer | Transactional email via SMTP |
| express-rate-limit | API rate limiting at the gateway layer |
| dotenv | Environment variable management |
| nodemon | Development auto-restart |

### Frontend (In Progress)
| Technology | Purpose |
|---|---|
| React + Vite | Frontend framework and build tool |
| Axios | HTTP client communicating with api-gateway |
| React Query | Server state management and caching |
| React Router | Client-side routing |
| Socket.io-client | Real-time connection to live-service |
| Razorpay JS SDK | Payment modal integration |

---

## Communication Patterns

This project deliberately uses three different communication patterns depending on the use case:

### Synchronous HTTP (Axios)
Used when a service needs an immediate response before it can continue.

```
enrollment-service ──── GET /api/v1/courses/:id ────► course-service
                    ◄─── course data ─────────────────
(needs lesson list to initialize progress tracking)

notification-service ── PATCH /api/v1/enrollments/certificate ──► enrollment-service
(writes certificate URL back after generation)
```

### Asynchronous Messaging (RabbitMQ)
Used for side effects that can happen in the background without blocking the main flow.

```
enrollment-service ──► enrollment.created ──► notification-service (welcome email)
enrollment-service ──► certificate.generate ──► notification-service (cert email)
```

### Real-Time Bidirectional (Socket.io)
Used for live features where both client and server need to push data to each other.

```
student/instructor ◄──► live-service ◄──► Redis Pub/Sub ◄──► live-service instances
(join room, send message, receive message, see presence)
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally or MongoDB Atlas
- RabbitMQ running locally (default port 5672)
- Redis running locally (default port 6379)
- AWS S3 bucket with credentials
- Razorpay test account
- Gmail account with App Password for SMTP

### Clone and Setup

```bash
git clone https://github.com/yourusername/lms-backend.git
cd lms-backend
```

Install dependencies for each service individually:

```bash
cd auth-service && npm install
cd ../user-service && npm install
cd ../course-service && npm install
cd ../enrollment-service && npm install
cd ../notification-service && npm install
cd ../live-service && npm install
cd ../api-gateway && npm install
```

### Environment Variables

Each service has its own `.env` file. Copy the `.env.example` from each service folder and fill in your values.

Key variables:

```
# api-gateway
ACCESS_SECRET=your_jwt_access_secret
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
COURSE_SERVICE_URL=http://localhost:3003
ENROLLMENT_SERVICE_URL=http://localhost:3004
LIVE_SERVICE_URL=http://localhost:3006

# auth-service
ACCESS_SECRET=your_jwt_access_secret
REFRESH_SECRET=your_jwt_refresh_secret
MONGO_URI=mongodb://localhost:27017/lms_auth

# course-service
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
S3_BUCKET=your_bucket

# enrollment-service
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret

# notification-service
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Run All Services

Open a separate terminal for each service:

```bash
# Terminal 1
cd api-gateway && npm run dev

# Terminal 2
cd auth-service && npm run dev

# Terminal 3
cd user-service && npm run dev

# Terminal 4
cd course-service && npm run dev

# Terminal 5
cd enrollment-service && npm run dev

# Terminal 6
cd notification-service && npm run dev

# Terminal 7
cd live-service && npm run dev
```

All traffic goes through the gateway on **port 3000**.

---

## API Reference

All requests go through `http://localhost:3000`. Protected routes require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Register student or instructor |
| POST | `/api/v1/auth/login` | No | Login and receive tokens |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| POST | `/api/v1/auth/logout` | No | Invalidate refresh token |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/users/profile` | Yes | Get or auto-create profile |
| PATCH | `/api/v1/users/profile` | Yes | Update bio and social links |
| PATCH | `/api/v1/users/avatar` | Yes | Upload avatar to S3 |

### Courses
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/courses` | Yes | Browse catalog with search and filters |
| GET | `/api/v1/courses/my` | Yes | Get instructor's own courses |
| GET | `/api/v1/courses/:id` | Yes | Get full course with sections and lessons |
| POST | `/api/v1/courses` | Yes | Create a new course |
| PATCH | `/api/v1/courses/:id` | Yes | Update course details |
| PATCH | `/api/v1/courses/:id/thumbnail` | Yes | Upload course thumbnail to S3 |
| PATCH | `/api/v1/courses/:id/publish` | Yes | Toggle publish/unpublish |
| DELETE | `/api/v1/courses/:id` | Yes | Delete course |
| POST | `/api/v1/courses/:id/sections` | Yes | Add a section |
| POST | `/api/v1/courses/:courseId/sections/:sectionId/lessons` | Yes | Upload a lesson |

### Enrollments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/enrollments/checkout` | Yes | Create Razorpay order for paid course |
| POST | `/api/v1/enrollments/verify-payment` | Yes | Verify payment and enroll |
| POST | `/api/v1/enrollments/free` | Yes | Enroll in free course directly |
| GET | `/api/v1/enrollments/my` | Yes | Get all student enrollments |
| PATCH | `/api/v1/enrollments/progress` | Yes | Mark a lesson complete |
| PATCH | `/api/v1/enrollments/certificate` | Internal | Write certificate URL back |

---

## Payment Flow

```
1. Student hits /checkout → gets Razorpay orderId
2. Frontend opens Razorpay modal → student pays
3. Razorpay returns paymentId + signature
4. Student hits /verify-payment with all three values
5. Server recomputes HMAC-SHA256 signature → verifies
6. Enrollment created with payment record
7. Welcome email sent via RabbitMQ → notification-service
```

---

## Real-Time Features

Live doubt sessions use Socket.io with Redis Pub/Sub:

```javascript
// Client connects and joins a course room
socket.emit("join:room", { room: courseId, userId });

// Client sends a message
socket.emit("send:message", { room: courseId, message, userId });

// Client listens for messages
socket.on("message", (data) => console.log(data));

// Client receives live presence updates
socket.on("presence", (members) => console.log("Online:", members));
```

---

## Future Plans

### Immediate (In Progress)
- [ ] `live-service` — Socket.io doubt sessions with Redis presence tracking
- [ ] React frontend with Vite — connecting all services
- [ ] Razorpay webhook for server-side payment confirmation
- [ ] JWT refresh token rotation on the frontend

### Short Term
- [ ] `ai-service` — Gemini API integration
  - Auto-generate course descriptions from title and topics
  - Lesson content summarizer stored alongside each lesson
  - Personalized learning path suggestions for students
  - Real-time AI doubt assistant in live sessions
- [ ] Jest unit and integration tests across all services
- [ ] Input validation with Joi or Zod across all endpoints
- [ ] Pagination on course catalog and enrollment lists

### Medium Term
- [ ] Full cloud deployment — Render for services, MongoDB Atlas, Redis Cloud, CloudAMQP
- [ ] Docker Compose for local development across all services
- [ ] CI/CD pipeline with GitHub Actions
- [ ] S3 pre-signed URLs for secure content delivery
- [ ] Course reviews and ratings service
- [ ] Instructor analytics dashboard — revenue, student progress, completion rates

### Long Term — Project 2
A more complex platform that extends these foundations with:
- [ ] Vector database integration (Pinecone) for semantic search
- [ ] RAG pipeline — AI that answers questions using course content as context
- [ ] Agentic AI flows — autonomous course recommendation agent
- [ ] Gemini function calling for structured AI tool use
- [ ] ElasticSearch for full-text search at scale
- [ ] WebRTC for peer-to-peer video in live sessions
- [ ] Kubernetes deployment with horizontal scaling

---

## Project Status

| Service | Status | Notes |
|---|---|---|
| `api-gateway` | ✅ Complete | JWT auth, rate limiting, proxy |
| `auth-service` | ✅ Complete | Register, login, refresh, logout |
| `user-service` | ✅ Complete | Profiles, avatar upload to S3 |
| `course-service` | ✅ Complete | CRUD, sections, lessons, S3, search |
| `enrollment-service` | ✅ Complete | Progress tracking, Razorpay payments |
| `notification-service` | ✅ Complete | RabbitMQ consumers, DLQ, emails |
| `live-service` | 🔄 In Progress | Socket.io + Redis |
| `ai-service` | 📋 Planned | Gemini integration |
| React Frontend | 📋 Planned | Vite + React Query + Socket.io-client |

---

## Author

**Aditya Kumar**
CSE Undergraduate — IIIT Ranchi (2028)
Competitive Programming Coordinator — IIIT Ranchi
ATF 2025 National Finalist — Top 0.1% of 250,000+ applicants

- GitHub: [@yourusername](https://github.com/adityasinghsss998-spec)
- LinkedIn: [linkedin.com/in/yourprofile](https://www.linkedin.com/in/aditya-kumar-419b29369/)

---

> This project is being built in public, one microservice at a time, with a focus on understanding every architectural decision rather than just shipping code.
