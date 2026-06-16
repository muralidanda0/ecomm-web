# 🛒 ecomm-web

A full-stack e-commerce web application built with the **MERN stack** — MongoDB, Express, React, and Node.js. Designed to handle everything from user authentication and product browsing to cart management and order processing, with a clean role-based access system for admins.

---

## ✨ Features

### 🔐 Authentication & Security
- Register and login with hashed passwords (`bcryptjs`)
- JWT-based authentication with 7-day token expiry
- Protected routes on both the API and the frontend
- Role-based access control — `user` and `admin` roles

### 🛍️ Shopping Experience
- Browse all available products
- View detailed product pages (name, price, stock, category)
- Add products to cart with real-time stock validation
- Update quantities or remove individual items from cart
- Clear entire cart in one click

### 📦 Orders
- Place orders directly from your cart
- Shipping address captured at checkout
- Stock auto-deducted when an order is placed
- Cart automatically cleared after a successful order
- View your full order history
- Track individual order details

### 🔧 Admin Controls
- Update order status: `pending → processing → shipped → delivered → cancelled`
- Guards prevent re-opening of already delivered or cancelled orders

---

## 🗂️ Project Structure

```
ecomm-web/
├── client/                     # React + Vite frontend
│   └── src/
│       ├── components/         # Navbar, ProductCard, ProtectedRoute
│       ├── context/            # AuthContext, CartContext
│       ├── pages/              # Home, Products, ProductDetail,
│       │                       # Cart, Checkout, Orders, OrderDetail,
│       │                       # Login, Register
│       └── services/           # authService, cartService,
│                               # orderService, productService
│
└── server/                     # Node.js + Express backend
    ├── server.js               # App entry point
    └── src/
        ├── config/             # MongoDB connection
        ├── controllers/        # authController, productController,
        │                       # cartController, orderController
        ├── middleware/         # auth (protect), admin, errorHandler
        ├── models/             # User, Product, Cart, Order
        └── routes/             # authRoutes, productRoutes,
                                # cartRoutes, orderRoutes
```

---

## 🔌 API Reference

All routes under `/api/cart` and `/api/orders` require a valid JWT in the `Authorization: Bearer <token>` header.

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create a new user account |
| POST | `/login` | Login and receive a JWT |
| GET | `/me` | Get current user profile |

### Products — `/api/products`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all products |
| GET | `/:id` | Get a single product |
| POST | `/` | Create product *(admin only)* |
| PUT | `/:id` | Update product *(admin only)* |
| DELETE | `/:id` | Delete product *(admin only)* |

### Cart — `/api/cart` *(Auth required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get current user's cart with product details |
| POST | `/add` | Add `{ productId, quantity }` to cart |
| PUT | `/update` | Update quantity of an existing item |
| DELETE | `/remove/:productId` | Remove one item from cart |
| DELETE | `/clear` | Clear entire cart |

### Orders — `/api/orders` *(Auth required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/place` | Place order from cart + address |
| GET | `/my-orders` | Get all orders of logged-in user |
| GET | `/:id` | Get single order detail |
| PUT | `/:id/status` | Update order status *(admin only)* |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally or a Atlas URI

### 1. Clone the repository

```bash
git clone https://github.com/muralidanda0/ecomm-web.git
cd ecomm-web
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecom-web
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Start the server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 3. Set up the client

```bash
cd ../client
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (`jsonwebtoken`), `bcryptjs` |
| Validation | `express-validator` |
| HTTP | `cors`, `dotenv` |
| Dev Tools | Nodemon, Postman |

---

## 🗺️ Roadmap

Here's what's planned for future versions:

- [ ] **Payment Gateway** — Razorpay / Stripe integration for real transactions
- [ ] **Product Reviews & Ratings** — Let users leave star ratings and written reviews
- [ ] **Wishlist** — Save products for later without adding to cart
- [ ] **Search & Filters** — Search by name, filter by category, price range, and availability
- [ ] **Admin Dashboard UI** — A dedicated admin panel to manage products, users, and orders visually
- [ ] **Email Notifications** — Order confirmation and shipping update emails via Nodemailer
- [ ] **Product Image Uploads** — Cloudinary integration for image hosting
- [ ] **Coupon & Discount Codes** — Apply promo codes at checkout
- [ ] **Multi-Address Support** — Save and switch between multiple delivery addresses
- [ ] **Pagination & Sorting** — Handle large product catalogs with server-side pagination

---

## 📁 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the server runs on | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ecom-web` |
| `JWT_SECRET` | Secret key for signing JWTs | `your_super_secret_key` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |

---

## 👤 Author

**muralidanda0**
GitHub: [@muralidanda0](https://github.com/muralidanda0)


