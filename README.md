# myBlog: A Full-Stack Blogging & Social Platform

![myBlog Logo](/client/public/logo.svg)

A modern, fast, and feature-rich full-stack blogging platform. Built with a robust **Node/Express.js MVC Architecture** on the backend and an optimized **React + Vite** single-page application on the frontend. 

## 🌟 Key Features

* **Authentication System:** Secure JWT-based user authentication and session persistence.
* **Content Management:** Create, read, edit, and delete rich-text blog posts with image thumbnails.
* **Social Engagement:** Follow users, like posts, and engage via comments.
* **Real-time Chat:** Instant messaging between users with a dedicated chat interface and unread message polling.
* **Notification System:** Get alerted when users like your posts, follow you, or comment.
* **Responsive Design:** Fully mobile-friendly UI with an optimized hamburger navigation.
* **Dark Mode:** Seamless Light/Dark theme toggle using CSS context variables.
* **Performance Focused:** Lazy-loaded React routes, debounced search, and highly optimized Mongoose `.lean()` queries.

---

## 🏗️ Technology Stack

**Frontend:**
* React 18 (Vite)
* React Router v6
* Axios
* Custom CSS (Monochrome Theme)
* Framer Motion (Page Transitions)

**Backend:**
* Node.js
* Express.js
* MongoDB & Mongoose
* JSON Web Tokens (JWT) & bcryptjs
* Multer (Image uploads)

---

## 📂 Project Structure

```text
myBlog--Blogging-Platform/
├── client/                 # React Frontend (Vite)
│   ├── public/             # Static Assets
│   └── src/
│       ├── components/     # Reusable UI Components (Navbar, Chat, Modals)
│       ├── context/        # Global Providers (AuthContext, ThemeContext)
│       └── pages/          # Route Components (Home, Profile, PostDetail)
├── src/                    # Node.js/Express Backend
│   ├── controllers/        # Business Logic (MVC pattern)
│   ├── middleware/         # Auth, Uploads, and Global Error Handling
│   ├── models/             # Mongoose Schemas
│   └── routes/             # API Endpoints
├── .env                    # Environment variables (Backend)
├── app.js                  # Entry point for Express Server
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/en/) (v16+)
* [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a Mongo Atlas URI)

### 2. Installation Setup

**Clone the repository and install Backend Dependencies:**
```bash
git clone <your-repo-url>
cd myBlog--Blogging-Platform
npm install
```

**Install Frontend Dependencies:**
```bash
cd client
npm install
```

### 3. Environment Variables

Create a `.env` file in the **root** folder and configure your secrets:

```env
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017/myBlog
JWT_SECRET=your_super_secret_jwt_key
```

### 4. Running the Application Locally

You will need two terminal windows to run both servers locally.

**Terminal 1: Start Backend API**
```bash
# From project root
npm start
```

**Terminal 2: Start Frontend App**
```bash
# From the client/ directory
npm run dev
```

Visit `http://localhost:5173` in your browser to start blogging!

---

## 👀 Platform Highlights

### 🌗 Stunning Visual Aesthetics
Carefully crafted monochrome design elements, crisp typography, and seamless Dark/Light mode toggles that provide a premium reading experience regardless of your environment. Notice the striking contrast between the Dark and Light mode themes below:

![Home Page - Dark Theme](/screenshots/Home%20Page.JPG)
![Home Page - Light Theme](/screenshots/Light.JPG)

### 🔍 Intuitive Content Discovery
Quickly find the content and authors you love using the debounced, real-time search interface tracking posts and profiles seamlessly.

![Real-time Search Interface](/screenshots/Search.JPG)

### 💬 Integrated Social Experience & Notifications
More than just a blog—connect directly with authors through a fully-integrated real-time chat architecture, complete with unread notification badges and instant message delivery.

![Notifications & Social Stats](/screenshots/Notification%20Page.JPG)

### 👤 Comprehensive User Profiles
Engineered to perform beautifully on any device. Personalize your feed and track your progress through detailed user profiles containing follower stats and dynamic posts arrays.

![Dynamic User Profiles](/screenshots/Profile%20Page.JPG)
## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📜 License
[MIT](https://choosealicense.com/licenses/mit/)
