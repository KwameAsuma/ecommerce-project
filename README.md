# 🚀 TradeHub: A Localized E-Commerce & Circular Auction Ecosystem

TradeHub is an innovative, dual-catalog platform functioning as an academic proof-of-concept. It bridges standard e-commerce with real-time bidding for local and imported goods.

## 🌟 Key Features

- **Dual-Catalog Architecture**: 
  - **Native Store**: For standard, fixed-price local goods with instant delivery capabilities.
  - **Live Auctions**: A real-time bidding platform for high-value imported items, leveraging WebSockets for instant updates.
- **Mock Escrow State-Machine**: Simulates Mobile Money (MoMo) processing delays and securely holds funds until delivery is verified, functioning as an internal banking system without real payment gateways.
- **Role-Based Workflows**: Tailored, secure dashboard experiences for Customers, Merchants, and Admins.

---

## 🛠️ Getting Started (For Grading Panel)

The entire TradeHub ecosystem is fully Dockerized. You do **not** need Node.js, PostgreSQL, or NGINX installed on your local machine.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running on your machine.

### 3-Step Setup

1. **Clone & Navigate**
   Clone the repository and open your terminal inside the root project directory.

2. **Configure Environment**
   Create a `.env` file at the root of the project and populate the following template with your own preferred credentials:

   ```env
   # Database Credentials
   DB_PORT=5432
   DB_HOST=db
   DB_USER=
   DB_PASSWORD=
   DB_NAME=

   DATABASE_URL=

   # Database Manager Credentials (pgAdmin)
   PGADMIN_EMAIL=
   PGADMIN_PASSWORD=

   # Backend API Configuration
   PORT=5000
   JWT_SECRET=
   ```

3. **Build & Run the Stack**
   Execute the following command to automatically build all containers and start the platform:
   ```bash
   docker compose up --build
   ```

Wait a few moments for the database to initialize and the servers to boot. You can then access the platform:
- **Main Platform (UI)**: `http://localhost`
- **Backend API**: `http://localhost/api`
- **Database Management (pgAdmin)**: `http://localhost:8080`

### Graceful Shutdown
To stop the environment safely without losing database data, press `Ctrl+C` in the terminal and run:
```bash
docker compose down
```
