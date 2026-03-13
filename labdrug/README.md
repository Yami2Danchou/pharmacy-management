# Labdrug Pharmacy — Sales & Inventory Management System

A full-stack Next.js web application built for **Labdrug Pharmacy, Isulan**.  
Stack: **Next.js 15 (App Router) · Neon DB (PostgreSQL) · bcryptjs · jose (JWT)**

---

## Features

| Module | What it does |
|---|---|
| 🔐 Authentication | JWT-based login with role-based access (Admin / Manager / Cashier) |
| 📊 Dashboard | Live stats: today's sales, low stock alerts, expiration warnings |
| 🛒 Sales (POS) | Process transactions with product search, cart, customer lookup, change calculation |
| 📦 Inventory | Real-time stock levels with low/out-of-stock filtering |
| ⏰ Expiration Monitor | Track batches expiring within 30 / 60 / 90 / 180 days using FEFO logic |
| 🚚 Supply Deliveries | Record incoming stock with batch codes, expiry dates, supplier info |
| ↩ Returns | Process defective / resellable / wrong-item returns; resellable items auto-restock |
| 📤 Stock Out | Record expired, damaged, or lost inventory deductions |
| 📋 Reports | Daily / weekly / monthly sales reports, top products, inventory snapshot |
| 👥 Customers | Registered customer database |
| 🏭 Suppliers | Supplier contact management |
| 👤 Employees | Staff records |
| 🔐 User Accounts | Admin-only user creation with role assignment |

---

## Setup Instructions

### 1. Clone / copy this project

```bash
# If starting from scratch:
npx create-next-app@latest . --js --no-typescript --eslint --no-tailwind --no-src-dir --app --no-turbopack
# Then copy all the files from this project over
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Neon DB

1. Go to [console.neon.tech](https://console.neon.tech) and create a free account
2. Create a new project (e.g. `labdrug-pharmacy`)
3. Copy the **Connection String** from your project dashboard
4. Open the **SQL Editor** in Neon and run `database/schema.sql` to create all tables and seed data

### 4. Configure environment variables

Copy `.env.local` and fill in your actual values:

```bash
DATABASE_URL=postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-random-secret-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
```

### 5. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Default login:**  
Username: `admin`  
Password: `password` ← Change this immediately after first login!

> To change: Go to **SQL Editor** in Neon and run:
> ```sql
> UPDATE users SET password_hash = '$2a$10$<new_bcrypt_hash>' WHERE username = 'admin';
> ```
> Or add a password-change endpoint to the app.

---

## Project Structure

```
labdrug/
├── app/
│   ├── page.js                    ← Login page
│   ├── layout.js                  ← Root layout
│   ├── globals.css                ← Design system CSS
│   ├── api/
│   │   ├── auth/login/            ← POST /api/auth/login
│   │   ├── auth/logout/           ← POST /api/auth/logout
│   │   ├── products/              ← GET, POST /api/products
│   │   ├── products/[id]/         ← GET, PUT, DELETE /api/products/:id
│   │   ├── sales/                 ← GET, POST /api/sales
│   │   ├── sales/[id]/            ← GET /api/sales/:id (with items)
│   │   ├── supplies/              ← GET, POST /api/supplies
│   │   ├── inventory/             ← GET /api/inventory
│   │   ├── expiration/            ← GET /api/expiration?days=90
│   │   ├── stock-out/             ← GET, POST /api/stock-out
│   │   ├── returns/               ← GET, POST /api/returns
│   │   ├── reports/               ← GET /api/reports?type=daily
│   │   ├── suppliers/             ← GET, POST /api/suppliers
│   │   ├── customers/             ← GET, POST /api/customers
│   │   ├── employees/             ← GET, POST /api/employees
│   │   ├── categories/            ← GET, POST /api/categories
│   │   ├── brands/                ← GET, POST /api/brands
│   │   └── users/                 ← GET, POST /api/users (Admin only)
│   └── dashboard/
│       ├── layout.js              ← Auth guard + sidebar shell
│       ├── page.js                ← Dashboard home
│       ├── sales/page.js          ← Sales list
│       ├── sales/new/page.js      ← POS / New Sale
│       ├── inventory/page.js      ← Inventory view
│       ├── expiration/page.js     ← Expiration monitor
│       ├── products/page.js       ← Products CRUD
│       ├── supplies/page.js       ← Supply deliveries list
│       ├── supplies/new/page.js   ← New delivery form
│       ├── stock-out/page.js      ← Stock out recording
│       ├── returns/page.js        ← Returns processing
│       ├── reports/page.js        ← Reports dashboard
│       ├── suppliers/page.js      ← Suppliers CRUD
│       ├── customers/page.js      ← Customers CRUD
│       ├── employees/page.js      ← Employees CRUD
│       └── users/page.js          ← User accounts (Admin)
├── components/
│   ├── DashboardShell.js          ← Sidebar + layout wrapper
│   └── DataTable.js               ← Reusable paginated table
├── lib/
│   ├── db.js                      ← Neon DB connection
│   └── auth.js                    ← JWT session management
├── database/
│   └── schema.sql                 ← Full PostgreSQL schema + seed data
├── .env.local                     ← Environment variables (fill this in)
├── next.config.js
└── package.json
```

---

## Deployment (Vercel — Recommended)

1. Push your project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add all environment variables from `.env.local` in Vercel's project settings
4. Deploy — Neon DB is already serverless-compatible and works perfectly with Vercel

---

## Database Schema Overview

The system uses **13 tables** based on the research ERD:

- `category`, `brand` — product classification
- `product` — medicines and items for sale
- `product_expirationdate` — batch tracking with FEFO inventory
- `employee`, `users` — staff and system accounts
- `customer` — registered customers
- `supplier` — supplier contacts
- `sale`, `sales_details`, `rx_details` — sales transactions
- `supply`, `supply_details` — incoming deliveries
- `stock_out`, `stock_out_details` — inventory deductions
- `return_of_products`, `return_details` — product returns

Plus 2 database **views**:
- `inventory_view` — live stock levels per product
- `expiring_products_view` — products nearing expiry

---

## Roles & Permissions

| Feature | Admin | Manager | Cashier |
|---|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ |
| New Sale (POS) | ✓ | ✓ | ✓ |
| View Sales | ✓ | ✓ | ✓ |
| View Inventory | ✓ | ✓ | ✓ |
| Expiration Monitor | ✓ | ✓ | ✓ |
| Add/Edit Products | ✓ | ✓ | — |
| Supply Deliveries | ✓ | ✓ | — |
| Stock Out | ✓ | ✓ | — |
| Returns | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | — |
| Suppliers | ✓ | ✓ | — |
| Customers | ✓ | ✓ | ✓ |
| Employees | ✓ | — | — |
| User Accounts | ✓ | — | — |
