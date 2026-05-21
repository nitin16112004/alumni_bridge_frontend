````md
# Alumni Bridge Frontend

A modern React + Vite frontend application for the Alumni Bridge platform that connects students, alumni, and colleges through mentorship, networking, discussions, jobs, events, and real-time communication.

---

# Features

- User Authentication
- Role-Based Dashboards
- Student & Alumni Networking
- Mentor Discovery System
- Mentorship Request Management
- AI Assistant
- Real-Time Chat with Socket.IO
- Discussion Forum
- Job Listings
- Event Management
- Notification System
- Toast Notifications
- Protected Routes
- Redux Toolkit State Management
- Responsive User Interface

---

# Tech Stack

## Frontend

- React.js
- Vite
- React Router DOM
- Redux Toolkit
- Axios
- Socket.IO Client
- CSS

---

# Project Structure

```bash
frontend/
│
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   └── ToastContainer.jsx
│
├── hooks/
│   └── useSocket.js
│
├── pages/
│   ├── auth/
│   ├── student/
│   ├── alumni/
│   ├── college/
│   ├── ChatPage.jsx
│   ├── Discussions.jsx
│   ├── DiscussionDetail.jsx
│   ├── Jobs.jsx
│   ├── Events.jsx
│   └── Profile.jsx
│
├── services/
│   └── api.js
│
├── store/
│   ├── index.js
│   └── slices/
│       ├── authSlice.js
│       ├── notificationSlice.js
│       └── toastSlice.js
│
├── App.jsx
├── main.jsx
├── index.css
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
````

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/alumni-bridge-frontend.git
```

---

## Navigate To Project

```bash
cd alumni-bridge-frontend
```

---

## Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
VITE_API_URL=https://alumni-bridge-backend.onrender.com/api
VITE_SOCKET_URL=https://alumni-bridge-backend.onrender.com
```

---

# Run Development Server

```bash
npm run dev
```

Application runs on:

```bash
http://localhost:5173
```

---

# Build Project

```bash
npm run build
```

---

# Preview Production Build

```bash
npm run preview
```

---

# Vercel Deployment

## Build Settings

| Setting          | Value         |
| ---------------- | ------------- |
| Framework Preset | Vite          |
| Build Command    | npm run build |
| Output Directory | dist          |

---

# Vercel Routing Configuration

Create a `vercel.json` file in the root directory.

```json
{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This prevents 404 errors during page refresh while using React Router.

---

# Available Routes

## Authentication

* `/login`
* `/register`
* `/forgot-password`

---

## Student Routes

* `/dashboard`
* `/mentors`
* `/mentors/:id`
* `/mentorship`
* `/ai`

---

## Alumni Routes

* `/alumni/dashboard`
* `/alumni/mentor`
* `/alumni/requests`

---

## College Routes

* `/college/dashboard`
* `/college/approvals`

---

## Shared Routes

* `/chat`
* `/discussions`
* `/discussions/:id`
* `/jobs`
* `/events`
* `/profile`

---

# API Integration

The frontend communicates with the backend API hosted on Render.

Backend URL:

```bash
https://alumni-bridge-backend.onrender.com
```

---

# Socket.IO Integration

Real-time features include:

* Live Chat
* Notifications
* Real-Time Updates

Socket connection is handled using:

```bash
hooks/useSocket.js
```

---

# Authentication

Authentication uses:

* JWT Tokens
* Protected Routes
* Role-Based Access Control

---

# State Management

Redux Toolkit is used for:

* Authentication State
* Notifications
* Toast Messages

---

# Deployment

Frontend deployed using Vercel.

---

# Author

Nitin Kumar

---

# License

This project is developed for educational and project purposes.

```
```
