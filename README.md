# Airline Logistics — Backend

Node.js + Express + MongoDB REST API running on **http://localhost:5000**

---

## Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

---

## Setup

### 1. Install dependencies
```bash
cd airline-backend
npm install
```

### 2. Configure environment
Create a `.env` file in `airline-backend/`:
```
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
```

### 3. Seed the database
```bash
npm run seed
```
Creates: 8 users, 5 vendors, 12 SKUs, 5 drivers, 8 orders, tracking locations, delivery proofs, theme.

### 4. Start the server
```bash
npm run dev
```
Server runs on **http://localhost:5000**

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start in production mode |
| `npm run seed` | Seed the database |
| `npm run dev:test` | Start in test mode (uses `.env.test`) |
| `npm test` | Run all Cypress tests |
| `npm run test:open` | Open Cypress interactive UI |
| `npm run test:headless` | Run Cypress headless |

---

## Running Tests

### 1. Create test environment
Create `.env.test` in `airline-backend/` pointing to a **separate test database**:
```
PORT=5000
MONGO_URI=<your_test_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
```

### 2. Start backend in test mode
```bash
npm run dev:test
```

### 3. Run tests
```bash
npm test
```

### 4. Reseed between test runs
```bash
node -e "require('./scripts/reseed').run().then(() => process.exit(0))"
```

---

## API Base URL

```
http://localhost:5000/api
```

All protected endpoints require:
```
Authorization: Bearer <token>
```

Get a token by calling `POST /api/auth/login` with valid credentials.
