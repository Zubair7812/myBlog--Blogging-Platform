# MyBlog Platform (React Migration)

A full-featured blogging platform built with **Express.js (Backend API)** and **React + Vite (Frontend)**.

## Project Structure

- **Backend (Root)**: Express server providing RESTful API endpoints.
- **Frontend (`/client`)**: React Single Page Application (SPA).

## 🚀 Getting Started

### 1. Prerequisites

- Node.js installed.
- MongoDB installed and running (or a cloud MongoDB URI).

### 2. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Running the Application

You need to run **both** the backend and frontend servers.

**Terminal 1: Start Backend API**
```bash
# From project root
npm start
# Server runs on http://localhost:3000
```
*(Note: Ensure you have a `.env` file with `MONGO_URL` if required, or update `app.js` with your DB connection).*

**Terminal 2: Start Frontend App**
```bash
# From project root
cd client
npm run dev
# App runs on http://localhost:5173
```

### 4. Features

- **Authentication**: Login, Register, Logout.
- **Blog CRUD**: Create, Read, Update, Delete posts.
- **Social**: Profile, Follow/Unfollow, Likes, Comments.
- **Real-time Chat**: Messaging system between users.
- **Notifications**: Alerts for interactions.
- **Admin Dashboard**: Manage users and content.
