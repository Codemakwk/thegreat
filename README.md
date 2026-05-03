# TheGreat E-Commerce Store

A full-stack, production-ready e-commerce application built with modern technologies.

## 🌐 Live Demo

- **Frontend (Website):** [https://thegreat-three.vercel.app](https://thegreat-three.vercel.app)
- **Backend (API):** [https://thegreat-uf6z.onrender.com](https://thegreat-uf6z.onrender.com)


## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS v3, Vite |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (Prisma ORM) + Redis (caching/sessions) |
| **Auth** | JWT (access + refresh tokens) + bcrypt |
| **Payments** | Stripe (PaymentIntents, Webhooks, Refunds) |
| **State** | Zustand (global), TanStack React Query (server) |
| **Forms** | React Hook Form + Zod validation |
| **UI** | Lucide icons, Recharts, React Hot Toast |

## 📁 Project Structure

```
thegreat/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (13 tables)
│   │   └── seed.ts            # Sample data seeder
│   └── src/
│       ├── config/             # env, db, redis, stripe, email
│       ├── controllers/        # Route handlers
│       ├── middleware/          # auth, authorize, validate, rateLimiter, errorHandler
│       ├── routes/v1/          # API route definitions
│       ├── utils/              # JWT, password, error class, email templates
│       ├── validators/         # Zod schemas
│       └── server.ts           # Express app entry
│
├── frontend/
│   └── src/
│       ├── api/                # Axios client + API modules
│       ├── components/
│       │   ├── layout/         # Header, Footer, Layout, AdminLayout
│       │   └── ui/             # Button, Input, Modal, Badge, Skeleton
│       ├── pages/              # Route-level page components
│       │   └── admin/          # Admin dashboard pages
│       ├── store/              # Zustand stores (auth, cart, theme)
│       ├── types/              # TypeScript interfaces
│       └── utils/              # Helpers, formatters, hooks
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- **Redis** (optional, graceful fallback)
- **Stripe** account (for payments)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

```bash
# Copy example env file
cd backend
cp .env.example .env
# Edit .env with your actual values
```

### Required Environment Variables

| Variable | Description |
|----------|------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret |
| `SMTP_HOST` | Email server host |
| `SMTP_PORT` | Email server port |
| `SMTP_USER` | Email username |
| `SMTP_PASS` | Email password / app password |
| `FRONTEND_URL` | Frontend URL for CORS |
| `GOOGLE_SHEET_URL` | Google Apps Script URL for logging (registrations, orders, etc.) |

### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed sample data
npx ts-node prisma/seed.ts
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

### 5. Open in Browser

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api/v1/health

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@thegreat.com | Admin123! |
| Customer | customer@thegreat.com | Customer123! |

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| POST | `/api/v1/auth/logout` | Logout (invalidate refresh token) |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| GET | `/api/v1/auth/verify-email` | Verify email with token |
| GET | `/api/v1/auth/me` | Get current user (auth) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products (filter, sort, paginate) |
| GET | `/api/v1/products/:id` | Get product detail |
| GET | `/api/v1/products/categories` | List categories |
| POST | `/api/v1/products` | Create product (admin) |
| PUT | `/api/v1/products/:id` | Update product (admin) |
| DELETE | `/api/v1/products/:id` | Delete product (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cart` | Get cart |
| POST | `/api/v1/cart/add` | Add item to cart |
| PUT | `/api/v1/cart/update` | Update item quantity |
| DELETE | `/api/v1/cart/remove` | Remove item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/orders/checkout` | Create order from cart |
| GET | `/api/v1/orders` | List user's orders |
| GET | `/api/v1/orders/:id` | Get order detail |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/create-intent` | Create Stripe PaymentIntent |
| POST | `/api/v1/payments/webhook` | Stripe webhook handler |
| POST | `/api/v1/payments/refund` | Refund payment (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard stats |
| GET | `/api/v1/admin/orders` | All orders |
| PATCH | `/api/v1/admin/orders/:id/status` | Update order status |
| GET | `/api/v1/admin/users` | All users |
| DELETE | `/api/v1/admin/users/:id` | Delete user |
| PATCH | `/api/v1/admin/users/:id/ban` | Ban/unban user |
| GET | `/api/v1/admin/coupons` | All coupons |
| POST | `/api/v1/admin/coupons` | Create coupon |

## 🎨 Features

- ✅ Responsive, mobile-first design
- ✅ Dark mode with system preference detection
- ✅ Glass morphism UI with smooth animations
- ✅ JWT authentication with automatic token refresh
- ✅ Role-based access control (customer / admin)
- ✅ Product filtering, sorting, search, and pagination
- ✅ Shopping cart with quantity management
- ✅ Multi-step checkout flow
- ✅ Stripe payment integration
- ✅ Order tracking and history
- ✅ Admin dashboard with revenue charts
- ✅ Product, order, user, and coupon management
- ✅ Email notifications (verification, reset, order confirmation)
- ✅ Rate limiting and security headers
- ✅ Input validation on all API routes
- ✅ Redis caching for product data
- ✅ Loading skeletons and error states
- ✅ Toast notifications
- ✅ SEO meta tags

## 📝 License

MIT
