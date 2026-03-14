# CoreInventory

> A full-stack inventory management system built for the **Odoo Hackathon 2024** — featuring real-time stock tracking, AI-powered chat assistance, role-based access control, and OTP-based authentication.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access](#role-based-access)
- [Pages & Modules](#pages--modules)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)

---

## Overview

CoreInventory is a production-ready inventory management platform that enables businesses to track stock movements, manage warehouses and suppliers, and get AI-powered insights — all through a clean, professional interface.

Built with **Next.js 14** on the frontend and **Node.js + Express + PostgreSQL** on the backend, it supports two user roles (Staff and Manager) with granular permissions, email OTP verification for signup and password reset, and a floating AI chatbot powered by Groq.

---

## Features

### Core Inventory
- **Products** — manage products grouped by category with SKU, stock levels, and reorder points
- **Receipts** — record incoming stock from suppliers
- **Deliveries** — track outgoing stock to customers
- **Transfers** — move stock between internal locations
- **Adjustments** — correct stock levels with reason tracking
- **Move History (Ledger)** — complete audit trail of all stock movements

### Warehouse & Supplier Management
- **Warehouses** — create and manage warehouses with multiple storage locations
- **Suppliers** — maintain a supplier directory linked to receipts

### Dashboard
- Real-time stats: total products, low stock alerts, out-of-stock count, pending receipts and deliveries
- Recent movements table
- At-a-glance inventory health

### Authentication
- Email + Password login
- OTP-based email verification on signup
- **Forgot Password** — reset password via emailed OTP
- JWT tokens with 7-day expiry
- Persistent sessions via localStorage

### AI Chatbot
- Floating chat widget powered by **Groq AI (llama-3.3-70b-versatile)**
- Answers inventory-related queries in natural language

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma v5 |
| Authentication | JWT, bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| AI | Groq API (llama-3.3-70b-versatile) |
| Fonts | Inter, Syne (Google Fonts) |

---

## Project Structure

```
CoreInventory/
├── client/                          # Next.js 14 frontend
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx       # Login + Forgot Password OTP flow
│   │   │   └── signup/page.tsx      # Signup + OTP verification
│   │   └── dashboard/
│   │       ├── layout.tsx           # Sidebar + Navbar wrapper
│   │       ├── page.tsx             # Dashboard home
│   │       ├── products/page.tsx
│   │       ├── receipts/page.tsx
│   │       ├── deliveries/page.tsx
│   │       ├── transfers/page.tsx
│   │       ├── adjustments/page.tsx
│   │       ├── ledger/page.tsx
│   │       ├── warehouses/page.tsx
│   │       ├── suppliers/page.tsx
│   │       └── database/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navbar.tsx
│   │   └── ChatWidget.tsx
│   ├── context/
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── lib/
│       ├── axios.ts
│       └── lightStyles.tsx
│
└── server/                          # Express backend
    ├── controllers/
    │   ├── auth.js                  # sendOtp, verifyOtp, login, forgotPassword, resetPassword
    │   ├── chat.js                  # Groq AI integration
    │   ├── products.js
    │   ├── receipts.js
    │   ├── deliveries.js
    │   ├── transfers.js
    │   ├── adjustments.js
    │   ├── ledger.js
    │   ├── dashboard.js
    │   ├── categories.js
    │   ├── suppliers.js
    │   ├── locations.js
    │   └── warehouses.js
    ├── routes/                      # Express routers
    ├── middleware/
    │   └── authMiddleware.js        # JWT verification
    ├── prisma/
    │   └── schema.prisma
    └── utils/
        └── mailer.js                # Nodemailer Gmail OTP sender
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL (running locally or via cloud)
- Gmail account with App Password enabled
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/CoreInventory.git
cd CoreInventory
```

**2. Install server dependencies**
```bash
cd server
npm install
```

**3. Install client dependencies**
```bash
cd ../client
npm install
```

**4. Set up the database**
```bash
cd ../server
npx prisma migrate dev --name init
npx prisma generate
```

**5. Run the development servers**

Terminal 1 — Backend:
```bash
cd server
npm run dev
```

Terminal 2 — Frontend:
```bash
cd client
npm run dev
```

**6. Open in browser**
```
http://localhost:3000
```

---

## Environment Variables

### `server/.env`
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/coreinventory
JWT_SECRET=your_jwt_secret_key
PORT=5000
GROQ_API_KEY=gsk_your_groq_api_key
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_char_app_password
```

### `client/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> **Note:** Never commit `.env` or `.env.local` to version control. Both files are listed in `.gitignore`.

---

## Authentication Flow

### Signup
```
User fills form (name, email, password, role)
  → POST /api/auth/send-otp
  → OTP emailed via Gmail SMTP
  → User enters 6-digit OTP
  → POST /api/auth/verify-otp
  → Account created, redirected to login
```

### Login
```
User enters email + password
  → POST /api/auth/login
  → JWT token returned
  → Token + user stored in localStorage
  → Redirected to /dashboard
```

### Forgot Password
```
User clicks "Forgot password?" on login page
  → Enters registered email
  → POST /api/auth/forgot-password
  → OTP emailed
  → User enters OTP + new password
  → POST /api/auth/reset-password
  → Password updated, redirected to login
```

---

## Role-Based Access

| Action | Staff | Manager |
|---|---|---|
| View all pages | ✅ | ✅ |
| Create receipts / deliveries / transfers / adjustments | ✅ | ✅ |
| **Validate** operations | ❌ | ✅ |
| Create / edit / delete warehouses | ❌ | ✅ |
| Create / edit / delete suppliers | ❌ | ✅ |

Role is assigned at signup and stored in the JWT. The frontend reads the role via the `useAuth()` hook:

```tsx
const user = useAuth();
const isManager = user?.role === 'MANAGER';

{isManager && <button>Validate</button>}
```

---

## Pages & Modules

| Route | Description |
|---|---|
| `/dashboard` | Overview stats + recent movements |
| `/dashboard/products` | Product list grouped by category |
| `/dashboard/receipts` | Incoming stock from suppliers |
| `/dashboard/deliveries` | Outgoing stock to customers |
| `/dashboard/transfers` | Internal stock movements between locations |
| `/dashboard/adjustments` | Manual stock corrections |
| `/dashboard/ledger` | Full audit trail with type filters |
| `/dashboard/warehouses` | Warehouse + location management |
| `/dashboard/suppliers` | Supplier directory |
| `/auth/login` | Login + forgot password |
| `/auth/signup` | Registration with OTP verification |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/send-otp` | Send signup OTP |
| POST | `/api/auth/verify-otp` | Verify OTP and create account |
| POST | `/api/auth/login` | Login and get JWT |
| POST | `/api/auth/forgot-password` | Send password reset OTP |
| POST | `/api/auth/reset-password` | Verify OTP and update password |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/products` | List / create products |
| GET/POST | `/api/receipts` | List / create receipts |
| PATCH | `/api/receipts/:id/validate` | Validate a receipt |
| GET/POST | `/api/deliveries` | List / create deliveries |
| PATCH | `/api/deliveries/:id/validate` | Validate a delivery |
| GET/POST | `/api/transfers` | List / create transfers |
| PATCH | `/api/transfers/:id/validate` | Validate a transfer |
| GET/POST | `/api/adjustments` | List / create adjustments |
| GET | `/api/ledger` | Full movement history |
| GET | `/api/dashboard` | Dashboard stats |

### Settings
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/warehouses` | List / create warehouses |
| PUT/DELETE | `/api/warehouses/:id` | Update / delete warehouse |
| GET/POST | `/api/suppliers` | List / create suppliers |
| GET | `/api/locations` | List all locations |
| GET | `/api/categories` | List all categories |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Send message to Groq AI chatbot |

---

## Database Schema

Key models in `prisma/schema.prisma`:

- **User** — id, name, email, passwordHash, role (STAFF / MANAGER)
- **Product** — id, name, sku, category, stock, reorderPoint
- **Warehouse** — id, name, address → has many Locations
- **Location** — id, name, warehouseId
- **Supplier** — id, name, contact, email
- **Receipt** — id, reference, supplierId, locationId, status, lines[]
- **Delivery** — id, reference, customerName, locationId, status, lines[]
- **Transfer** — id, reference, fromLocationId, toLocationId, status, lines[]
- **Adjustment** — id, reference, locationId, reason, status, lines[]
- **StockLedger** — id, productId, locationId, movementType, quantityChange, quantityAfter, reference, createdById

---

## Scripts

### Server
```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Start without hot reload
```

### Client
```bash
npm run dev      # Start Next.js dev server on port 3000
npm run build    # Production build
npm start        # Start production server
```

### Database
```bash
npx prisma studio          # Visual database browser
npx prisma migrate dev     # Run migrations
npx prisma generate        # Regenerate Prisma client
npx prisma db seed         # Seed with sample data (if seed script exists)
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

This project was built for the **Odoo Hackathon 2024**. All rights reserved.
