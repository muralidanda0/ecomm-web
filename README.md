# 🛒 ShopNova — Full-Stack MERN E-Commerce Platform

A production-ready e-commerce web application built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

---

## 📁 Folder Structure

```
ecom-web/
├── client/                         # React.js Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.css
│   │   ├── pages/                  # Route-level page components
│   │   │   ├── Home.jsx
│   │   │   └── Home.css
│   │   ├── services/               # Axios API service layer
│   │   │   └── api.js
│   │   ├── App.jsx                 # Root component with React Router
│   │   ├── main.jsx                # Vite entry point
│   │   └── index.css               # Global design system & CSS variables
│   ├── .env                        # Frontend environment variables
│   ├── .gitignore
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Node.js + Express.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection (Mongoose)
│   │   ├── controllers/            # Route handler logic (to be added)
│   │   ├── middleware/             # Auth, error, validation middleware (to be added)
│   │   ├── models/                 # Mongoose schemas (to be added)
│   │   └── routes/
│   │       └── health.routes.js    # GET /api/health
│   ├── server.js                   # Express app entry point
│   ├── .env                        # Backend environment variables
│   ├── .gitignore
│   └── package.json
│
├── .gitignore                      # Root-level gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- npm v9+

---

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd ecom-web
```

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecom-web
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

Start the server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**  
Health check: **GET http://localhost:5000/api/health**

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
```

Edit `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

App runs at: **http://localhost:5173**

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js, Vite, React Router DOM    |
| HTTP Client| Axios                               |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB, Mongoose                   |
| Auth       | JWT (JSON Web Tokens)               |
| Dev Tools  | Nodemon, dotenv                     |
| Styling    | Vanilla CSS, Google Fonts (Inter)   |

---

## 🔌 API Endpoints

| Method | Endpoint      | Description              |
|--------|---------------|--------------------------|
| GET    | /api/health   | Server health check      |

> More endpoints (products, auth, cart, orders) will be added in upcoming phases.

---

## 🗺️ Roadmap

- [x] Project scaffolding (client + server)
- [x] MongoDB connection via Mongoose
- [x] Express server with CORS
- [x] React Router DOM setup
- [x] Home page UI
- [ ] User authentication (JWT)
- [ ] Product CRUD API
- [ ] Shopping cart
- [ ] Order management
- [ ] Admin dashboard
- [ ] Stripe payment integration

---

## 📜 License

MIT © ShopNova
