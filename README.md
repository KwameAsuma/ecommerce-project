# TradeHub Platform

Welcome to the TradeHub eCommerce Platform!

## Getting Started

This repository contains both the frontend React application and the backend Node.js API with Prisma ORM.

### Backend Setup (Important!)

When pulling this code for the first time, you must initialize the database and seed it with test products and auctions. We have created a convenient setup script for you.

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Run the automated setup script:
   ```bash
   npm run setup
   ```
   *This command will install backend dependencies (`npm install`), apply the database schema (`npx prisma db push`), and seed the database with mock users, products, and auctions (`npx prisma db seed`).*
3. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

### Test Accounts

The seed script creates the following accounts for you to test with:

**Admin Account**
- Email: `admin@tradehub.com`
- Password: `admin123`

**Merchant Account**
- Email: `merchant@tradehub.com`
- Password: `merchant123`

Happy building!
