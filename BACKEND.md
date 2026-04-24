# Airline Logistics — Backend
> Re-run `npm run docs` from project root after updating routes, models, or validation files.

---

## Starting the Backend

### Install
```bash
cd airline-backend
npm install
```

### Environment — `.env`
```
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
```
Use a separate `.env.test` pointing to a test database for Cypress.

### Scripts
| Command | Description |
|---|---|
| `npm run dev` | Development with nodemon (hot reload) |
| `npm start` | Production |
| `npm run dev:test` | Test mode using `.env.test` |
| `npm run seed` | Seed the database |
| `npm test` | Run Cypress tests |
| `npm run test:open` | Open Cypress UI |
| `npm run test:headless` | Run Cypress headless |

Server runs on **http://localhost:5000**

### Seed
```bash
npm run seed
```
Seeds: 8 users, 5 vendors, 12 SKUs, 5 drivers, 8 orders, locations, delivery proofs, theme.

### Reseed (between test runs)
```bash
node -e "require('./scripts/reseed').run().then(() => process.exit(0))"
```

---

## Global Conventions

**Auth header (all protected routes)**
```
Authorization: Bearer <jwt_token>
```

**Standard response envelope**
```json
{ "success": true,  "data": { } }
{ "success": false, "message": "Error description" }
```

**Roles**
| Role | Permissions |
|---|---|
| `admin` | Full access to all endpoints |
| `airline` | Create/update orders, analytics, read-only on others |
| `driver` | Order status transitions, tracking, proof submission |

---

## All APIs — Quick Reference (34 endpoints)

| # | Method | Endpoint | Auth | Role |
|---|---|---|---|---|
| 1 | POST | `/api/auth/register` | No | — |
| 2 | POST | `/api/auth/login` | No | — |
| 3 | GET | `/api/auth/me` | Yes | Any |
| 4 | POST | `/api/auth/logout` | Yes | Any |
| 5 | GET | `/api/users` | Yes | admin |
| 6 | POST | `/api/users` | Yes | admin |
| 7 | GET | `/api/users/:id` | Yes | Any |
| 8 | PUT | `/api/users/:id` | Yes | Any |
| 9 | DELETE | `/api/users/:id` | Yes | admin |
| 10 | GET | `/api/vendors` | Yes | Any |
| 11 | GET | `/api/vendors/:id` | Yes | Any |
| 12 | POST | `/api/vendors` | Yes | admin |
| 13 | PUT | `/api/vendors/:id` | Yes | admin |
| 14 | DELETE | `/api/vendors/:id` | Yes | admin |
| 15 | GET | `/api/skus` | Yes | Any |
| 16 | GET | `/api/skus/:id` | Yes | Any |
| 17 | POST | `/api/skus` | Yes | admin |
| 18 | PUT | `/api/skus/:id` | Yes | admin |
| 19 | DELETE | `/api/skus/:id` | Yes | admin |
| 20 | GET | `/api/orders` | Yes | Any |
| 21 | POST | `/api/orders` | Yes | admin, airline |
| 22 | GET | `/api/orders/:id` | Yes | Any |
| 23 | PUT | `/api/orders/:id` | Yes | admin, airline |
| 24 | DELETE | `/api/orders/:id` | Yes | admin |
| 25 | POST | `/api/orders/:id/assign-driver` | Yes | admin |
| 26 | PUT | `/api/orders/:id/status` | Yes | admin, airline |
| 27 | PUT | `/api/orders/:id/picked` | Yes | admin, airline, driver |
| 28 | PUT | `/api/orders/:id/enroute` | Yes | admin, airline, driver |
| 29 | PUT | `/api/orders/:id/delivered` | Yes | admin, airline, driver |
| 30 | POST | `/api/orders/:id/proof` | Yes | Any |
| 31 | GET | `/api/orders/:id/proof` | Yes | Any |
| 32 | GET | `/api/drivers` | Yes | Any |
| 33 | POST | `/api/drivers` | Yes | admin |
| 34 | GET | `/api/drivers/:id` | Yes | Any |
| 35 | PUT | `/api/drivers/:id` | Yes | admin |
| 36 | PUT | `/api/drivers/:id/status` | Yes | Any |
| 37 | DELETE | `/api/drivers/:id` | Yes | admin |
| 38 | GET | `/api/tracking/:orderId` | Yes | Any |
| 39 | POST | `/api/tracking` | Yes | Any |
| 40 | GET | `/api/proof/:orderId` | Yes | Any |
| 41 | POST | `/api/proof` | Yes | Any |
| 42 | GET | `/api/analytics/summary` | Yes | admin, airline |
| 43 | GET | `/api/analytics/orders-by-status` | Yes | admin, airline |
| 44 | GET | `/api/analytics/orders` | Yes | admin, airline |
| 45 | GET | `/api/analytics/sla` | Yes | admin, airline |
| 46 | GET | `/api/theme` | No | — |
| 47 | PUT | `/api/theme` | Yes | admin |

---

## API Schemas

---

### 1. `POST /api/auth/register`
Auth: None

**Request**
```json
{
  "name": "string (required)",
  "email": "string, valid email (required)",
  "password": "string, min 6 chars (required)",
  "role": "admin | airline | driver (optional, default: airline)"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "token": "jwt_string",
    "user": { "id": "ObjectId", "name": "string", "email": "string", "role": "string" }
  }
}
```
**Errors:** `400/422` validation fail · `409` duplicate email

---

### 2. `POST /api/auth/login`
Auth: None

**Request**
```json
{
  "email": "string, valid email (required)",
  "password": "string (required)"
}
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "token": "jwt_string",
    "user": { "id": "ObjectId", "name": "string", "email": "string", "role": "string" }
  }
}
```
**Errors:** `401` invalid credentials

---

### 3. `GET /api/auth/me`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "string",
    "email": "string",
    "role": "admin | airline | driver",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```
**Errors:** `401` no/invalid token

---

### 4. `POST /api/auth/logout`
Auth: Required

**Response 200**
```json
{ "success": true, "message": "Logged out successfully" }
```
**Errors:** `401` no/invalid token

---

### 5. `GET /api/users`
Auth: Required · Role: `admin`

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "name": "string",
      "email": "string",
      "role": "admin | airline | driver",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### 6. `POST /api/users`
Auth: Required · Role: `admin`

**Request**
```json
{
  "name": "string (required)",
  "email": "string, valid email (required)",
  "password": "string, min 6 chars (required)",
  "role": "admin | airline | driver (optional, default: airline)"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "string",
    "email": "string",
    "role": "string",
    "createdAt": "ISO date"
  }
}
```
**Errors:** `400/422` validation fail · `409` duplicate email

---

### 7. `GET /api/users/:id`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "string",
    "email": "string",
    "role": "string",
    "createdAt": "ISO date"
  }
}
```
**Errors:** `400` invalid id · `404` not found

---

### 8. `PUT /api/users/:id`
Auth: Required

**Request** (all optional)
```json
{
  "name": "string",
  "email": "string, valid email",
  "role": "admin | airline | driver"
}
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "string",
    "email": "string",
    "role": "string",
    "updatedAt": "ISO date"
  }
}
```

---

### 9. `DELETE /api/users/:id`
Auth: Required · Role: `admin`

**Response 200**
```json
{ "success": true, "data": {} }
```

---

### 10. `GET /api/vendors`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "name": "string",
      "contact": "string",
      "email": "string",
      "address": "string",
      "isActive": true,
      "createdAt": "ISO date"
    }
  ]
}
```

---

### 11. `GET /api/vendors/:id`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "string",
    "contact": "string",
    "email": "string",
    "address": "string",
    "isActive": true,
    "createdAt": "ISO date"
  }
}
```
**Errors:** `400` invalid id · `404` not found

---

### 12. `POST /api/vendors`
Auth: Required · Role: `admin`

**Request**
```json
{
  "name": "string (required)",
  "contact": "string (optional)",
  "email": "string, valid email (optional)",
  "address": "string (optional)"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "string",
    "contact": "string",
    "email": "string",
    "address": "string",
    "isActive": true,
    "createdAt": "ISO date"
  }
}
```

---

### 13. `PUT /api/vendors/:id`
Auth: Required · Role: `admin`

**Request** (all optional)
```json
{
  "name": "string",
  "contact": "string",
  "email": "string, valid email",
  "address": "string"
}
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "string",
    "contact": "string",
    "email": "string",
    "address": "string",
    "isActive": true,
    "updatedAt": "ISO date"
  }
}
```

---

### 14. `DELETE /api/vendors/:id`
Auth: Required · Role: `admin`

**Response 200**
```json
{ "success": true, "data": {} }
```

---

### 15. `GET /api/skus`
Auth: Required

**Query Params (optional)**
| Param | Type | Description |
|---|---|---|
| `vendorId` | ObjectId string | Filter by vendor |
| `airportCode` | string | Filter by airport code |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "code": "string",
      "name": "string",
      "description": "string",
      "vendor": "ObjectId",
      "unit": "string",
      "isActive": true,
      "createdAt": "ISO date"
    }
  ]
}
```

---

### 16. `GET /api/skus/:id`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "code": "string",
    "name": "string",
    "description": "string",
    "vendor": "ObjectId",
    "unit": "string",
    "isActive": true
  }
}
```
**Errors:** `400` invalid id · `404` not found

---

### 17. `POST /api/skus`
Auth: Required · Role: `admin`

**Request**
```json
{
  "code": "string (required, unique)",
  "name": "string (required)",
  "description": "string (optional)",
  "vendor": "ObjectId string (optional)",
  "unit": "string (optional)"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "code": "string",
    "name": "string",
    "description": "string",
    "vendor": "ObjectId",
    "unit": "string",
    "isActive": true
  }
}
```
**Errors:** `400/409` duplicate code

---

### 18. `PUT /api/skus/:id`
Auth: Required · Role: `admin`

**Request** (all optional)
```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "vendor": "ObjectId string",
  "unit": "string"
}
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "code": "string",
    "name": "string",
    "description": "string",
    "unit": "string",
    "updatedAt": "ISO date"
  }
}
```

---

### 19. `DELETE /api/skus/:id`
Auth: Required · Role: `admin`

**Response 200**
```json
{ "success": true, "data": {} }
```

---

### 20. `GET /api/orders`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "orderNumber": "string",
      "vendor": { "_id": "ObjectId", "name": "string" },
      "driver": { "_id": "ObjectId", "vehicle": "string" },
      "items": [{ "sku": "ObjectId", "quantity": 10 }],
      "status": "pending | assigned | in_transit | delivered | cancelled",
      "scheduledAt": "ISO date",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### 21. `POST /api/orders`
Auth: Required · Role: `admin`, `airline`

**Request**
```json
{
  "orderNumber": "string (required, unique)",
  "vendor": "ObjectId string (optional)",
  "driver": "ObjectId string (optional)",
  "items": [{ "sku": "ObjectId string", "quantity": 10 }],
  "status": "pending | assigned | in_transit | delivered | cancelled (optional, default: pending)",
  "scheduledAt": "ISO date string (optional)"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "orderNumber": "string",
    "status": "pending",
    "createdAt": "ISO date"
  }
}
```
**Errors:** `400/409` duplicate orderNumber · `422` validation fail

---

### 22. `GET /api/orders/:id`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "orderNumber": "string",
    "vendor": { "_id": "ObjectId", "name": "string" },
    "driver": { "_id": "ObjectId", "vehicle": "string" },
    "items": [{ "sku": "ObjectId", "quantity": 10 }],
    "status": "string",
    "scheduledAt": "ISO date",
    "createdAt": "ISO date"
  }
}
```
**Errors:** `400` invalid id · `404` not found

---

### 23. `PUT /api/orders/:id`
Auth: Required · Role: `admin`, `airline`

**Request** (all optional)
```json
{
  "orderNumber": "string",
  "vendor": "ObjectId string",
  "driver": "ObjectId string",
  "items": [{ "sku": "ObjectId string", "quantity": 10 }],
  "status": "pending | assigned | in_transit | delivered | cancelled",
  "scheduledAt": "ISO date string"
}
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "orderNumber": "string",
    "status": "string",
    "updatedAt": "ISO date"
  }
}
```

---

### 24. `DELETE /api/orders/:id`
Auth: Required · Role: `admin`

**Response 200**
```json
{ "success": true, "data": {} }
```

---

### 25. `POST /api/orders/:id/assign-driver`
Auth: Required · Role: `admin`

**Request**
```json
{ "driverId": "ObjectId string (required)" }
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "orderNumber": "string",
    "driver": "ObjectId",
    "status": "assigned"
  }
}
```
**Errors:** `400` missing driverId · `404` order or driver not found

---

### 26. `PUT /api/orders/:id/status`
Auth: Required · Role: `admin`, `airline`

**Request**
```json
{ "status": "pending | assigned | in_transit | delivered | cancelled (required)" }
```
**Response 200**
```json
{
  "success": true,
  "data": { "_id": "ObjectId", "status": "string", "updatedAt": "ISO date" }
}
```
**Errors:** `400` invalid status value

---

### 27. `PUT /api/orders/:id/picked`
Auth: Required · Role: `admin`, `airline`, `driver`

No request body.

**Response 200**
```json
{ "success": true, "data": { "_id": "ObjectId", "status": "picked" } }
```

---

### 28. `PUT /api/orders/:id/enroute`
Auth: Required · Role: `admin`, `airline`, `driver`

No request body.

**Response 200**
```json
{ "success": true, "data": { "_id": "ObjectId", "status": "enroute" } }
```

---

### 29. `PUT /api/orders/:id/delivered`
Auth: Required · Role: `admin`, `airline`, `driver`

No request body.

**Response 200**
```json
{ "success": true, "data": { "_id": "ObjectId", "status": "delivered" } }
```

---

### 30. `POST /api/orders/:id/proof`
Auth: Required

**Request**
```json
{
  "imageUrl": "string (optional)",
  "signature": "string, base64 (optional)",
  "notes": "string (optional)"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "order": "ObjectId",
    "driver": "ObjectId",
    "imageUrl": "string",
    "signature": "string",
    "notes": "string",
    "deliveredAt": "ISO date"
  }
}
```
**Errors:** `404` order not found

---

### 31. `GET /api/orders/:id/proof`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "order": "ObjectId",
    "driver": { "_id": "ObjectId", "vehicle": "string", "licenseNumber": "string" },
    "imageUrl": "string",
    "signature": "string",
    "notes": "string",
    "deliveredAt": "ISO date"
  }
}
```
Returns `"data": null` if no proof exists for the order.

---

### 32. `GET /api/drivers`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "user": { "_id": "ObjectId", "name": "string", "email": "string" },
      "licenseNumber": "string",
      "vehicle": "string",
      "isAvailable": true,
      "createdAt": "ISO date"
    }
  ]
}
```

---

### 33. `POST /api/drivers`
Auth: Required · Role: `admin`

**Request**
```json
{
  "user": "ObjectId string (required)",
  "licenseNumber": "string (optional)",
  "vehicle": "string (optional)",
  "isAvailable": "boolean (optional, default: true)"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "user": "ObjectId",
    "licenseNumber": "string",
    "vehicle": "string",
    "isAvailable": true,
    "createdAt": "ISO date"
  }
}
```

---

### 34. `GET /api/drivers/:id`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "user": { "_id": "ObjectId", "name": "string", "email": "string" },
    "licenseNumber": "string",
    "vehicle": "string",
    "isAvailable": true,
    "createdAt": "ISO date"
  }
}
```
**Errors:** `400` invalid id · `404` not found

---

### 35. `PUT /api/drivers/:id`
Auth: Required · Role: `admin`

**Request** (all optional)
```json
{
  "licenseNumber": "string",
  "vehicle": "string",
  "isAvailable": "boolean"
}
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "licenseNumber": "string",
    "vehicle": "string",
    "isAvailable": true,
    "updatedAt": "ISO date"
  }
}
```

---

### 36. `PUT /api/drivers/:id/status`
Auth: Required

**Request**
```json
{ "isAvailable": "boolean (required)" }
```
**Response 200**
```json
{
  "success": true,
  "data": { "_id": "ObjectId", "isAvailable": true, "updatedAt": "ISO date" }
}
```

---

### 37. `DELETE /api/drivers/:id`
Auth: Required · Role: `admin`

**Response 200**
```json
{ "success": true, "data": {} }
```

---

### 38. `GET /api/tracking/:orderId`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "order": "ObjectId",
      "driver": "ObjectId",
      "coordinates": { "lat": 17.385, "lng": 78.4867 },
      "recordedAt": "ISO date"
    }
  ]
}
```
Sorted by `recordedAt` ascending.

---

### 39. `POST /api/tracking`
Auth: Required

**Request**
```json
{
  "order": "ObjectId string (optional)",
  "driver": "ObjectId string (optional)",
  "coordinates": { "lat": 17.385, "lng": 78.4867 }
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "order": "ObjectId",
    "driver": "ObjectId",
    "coordinates": { "lat": 17.385, "lng": 78.4867 },
    "recordedAt": "ISO date"
  }
}
```

---

### 40. `GET /api/proof/:orderId`
Auth: Required

**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "order": "ObjectId",
    "driver": { "_id": "ObjectId", "vehicle": "string", "licenseNumber": "string" },
    "imageUrl": "string",
    "signature": "string",
    "notes": "string",
    "deliveredAt": "ISO date"
  }
}
```

---

### 41. `POST /api/proof`
Auth: Required

**Request**
```json
{
  "order": "ObjectId string (required)",
  "driver": "ObjectId string (optional)",
  "imageUrl": "string (optional)",
  "signature": "string (optional)",
  "notes": "string (optional)"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "order": "ObjectId",
    "driver": "ObjectId",
    "imageUrl": "string",
    "notes": "string",
    "deliveredAt": "ISO date"
  }
}
```

---

### 42. `GET /api/analytics/summary`
Auth: Required · Role: `admin`, `airline`

**Response 200**
```json
{
  "success": true,
  "data": {
    "totalOrders": 10,
    "delivered": 4,
    "pending": 6,
    "availableDrivers": 3
  }
}
```

---

### 43. `GET /api/analytics/orders-by-status`
Auth: Required · Role: `admin`, `airline`

**Response 200**
```json
{
  "success": true,
  "data": [
    { "_id": "pending",    "count": 3 },
    { "_id": "delivered",  "count": 4 },
    { "_id": "in_transit", "count": 2 }
  ]
}
```

---

### 44. `GET /api/analytics/orders`
Auth: Required · Role: `admin`, `airline`

**Response 200**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "byStatus": [
      { "_id": "pending",   "count": 3 },
      { "_id": "delivered", "count": 4 }
    ]
  }
}
```

---

### 45. `GET /api/analytics/sla`
Auth: Required · Role: `admin`, `airline`

**Response 200**
```json
{
  "success": true,
  "data": {
    "delivered": 4,
    "total": 10,
    "slaRate": "40.00%"
  }
}
```

---

### 46. `GET /api/theme`
Auth: None (public)

**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "primaryColor": "#1976d2",
    "secondaryColor": "#dc004e",
    "logoUrl": "string",
    "companyName": "string",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

### 47. `PUT /api/theme`
Auth: Required · Role: `admin`

**Request** (all optional)
```json
{
  "primaryColor": "string (hex color)",
  "secondaryColor": "string (hex color)",
  "logoUrl": "string (URL)",
  "companyName": "string"
}
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "primaryColor": "#ff0000",
    "secondaryColor": "#00ff00",
    "logoUrl": "string",
    "companyName": "string",
    "updatedAt": "ISO date"
  }
}
```
Upserts — creates theme document if none exists.
