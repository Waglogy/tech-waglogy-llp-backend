# 🚀 Tech Waglogy LLP - API Quick Reference

## 📍 Base URL
```
http://localhost:5000/api/v1
```

---

## 1️⃣ QUERY FORM API (Simple Message)

### POST - Submit Query
```
POST /api/v1/queries
```
**Body:**
```json
{
  "message": "I need help with web development"
}
```

### GET - Get All Queries
```
GET /api/v1/queries
GET /api/v1/queries?page=1&limit=10&status=new
```

### GET - Get Single Query
```
GET /api/v1/queries/:id
```

### PUT - Update Query Status
```
PUT /api/v1/queries/:id
```
**Body:**
```json
{
  "status": "read"
}
```
**Status options:** `new`, `read`, `responded`, `closed`

### DELETE - Delete Query
```
DELETE /api/v1/queries/:id
```

---

## 2️⃣ CONTACT FORM API (Full Details)

### POST - Submit Contact Form
```
POST /api/v1/contacts
```
**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-123-4567",
  "organizationName": "Tech Solutions Inc",
  "budgetRange": "$10,000 - $25,000",
  "projectDetails": "We need a complete e-commerce platform with payment integration"
}
```

**Budget Range Options:**
- `Less than $5,000`
- `$5,000 - $10,000`
- `$10,000 - $25,000`
- `$25,000 - $50,000`
- `$50,000 - $100,000`
- `More than $100,000`

### GET - Get All Contacts
```
GET /api/v1/contacts
GET /api/v1/contacts?page=1&limit=10&status=new
```

### GET - Get Single Contact
```
GET /api/v1/contacts/:id
```

### PUT - Update Contact Status
```
PUT /api/v1/contacts/:id
```
**Body:**
```json
{
  "status": "contacted"
}
```
**Status options:** `new`, `in-progress`, `contacted`, `qualified`, `closed`

### DELETE - Delete Contact
```
DELETE /api/v1/contacts/:id
```

---

## 3️⃣ ADMIN AUTHENTICATION API

### POST - Admin Registration
```
POST /api/v1/auth/register
```
**Body:**
```json
{
  "name": "Admin User",
  "email": "admin@waglogy.com",
  "password": "securePassword123",
  "role": "admin"
}
```
**Note:** Role defaults to `user` if not specified. Use `admin` for admin registration.

### POST - Admin Login
```
POST /api/v1/auth/login
```
**Body:**
```json
{
  "email": "admin@waglogy.com",
  "password": "securePassword123"
}
```
**Response includes JWT token:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "64abc123def456...",
    "name": "Admin User",
    "email": "admin@waglogy.com",
    "role": "admin"
  }
}
```

### GET - Get Current Admin User
```
GET /api/v1/auth/me
```
**Headers:**
```
Authorization: Bearer <your_jwt_token>
```
**OR** include the token cookie automatically sent with request.

### POST - Admin Logout
```
POST /api/v1/auth/logout
```
**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

### PUT - Update Admin Details
```
PUT /api/v1/auth/updatedetails
```
**Headers:**
```
Authorization: Bearer <your_jwt_token>
```
**Body:**
```json
{
  "name": "Updated Admin Name",
  "email": "newemail@waglogy.com"
}
```

### PUT - Update Admin Password
```
PUT /api/v1/auth/updatepassword
```
**Headers:**
```
Authorization: Bearer <your_jwt_token>
```
**Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

---

## 🧪 Postman Test Examples

### Test 1: Submit Query
```
Method: POST
URL: http://localhost:5000/api/v1/queries
Headers: Content-Type: application/json
Body:
{
  "message": "I'm interested in your mobile app development services"
}
```

### Test 2: Submit Contact Form
```
Method: POST
URL: http://localhost:5000/api/v1/contacts
Headers: Content-Type: application/json
Body:
{
  "fullName": "Sarah Johnson",
  "email": "sarah@techcorp.com",
  "phone": "+1-555-987-6543",
  "organizationName": "TechCorp International",
  "budgetRange": "$25,000 - $50,000",
  "projectDetails": "Looking to develop a SaaS platform for HR management"
}
```

### Test 3: Get All Queries
```
Method: GET
URL: http://localhost:5000/api/v1/queries
```

### Test 4: Get All Contacts
```
Method: GET
URL: http://localhost:5000/api/v1/contacts
```

### Test 5: Admin Registration
```
Method: POST
URL: http://localhost:5000/api/v1/auth/register
Headers: Content-Type: application/json
Body:
{
  "name": "Admin User",
  "email": "admin@waglogy.com",
  "password": "admin123456",
  "role": "admin"
}
```

### Test 6: Admin Login
```
Method: POST
URL: http://localhost:5000/api/v1/auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "admin@waglogy.com",
  "password": "admin123456"
}
```
**Note:** Copy the token from the response to use in protected routes.

### Test 7: Get Current Admin User
```
Method: GET
URL: http://localhost:5000/api/v1/auth/me
Headers: 
  Authorization: Bearer <paste_your_token_here>
```

---

## ✅ Success Responses

**POST Success (201):**
```json
{
  "status": "success",
  "message": "Query/Contact submitted successfully",
  "data": { ... }
}
```

**GET Success (200):**
```json
{
  "status": "success",
  "count": 5,
  "totalPages": 1,
  "currentPage": 1,
  "data": [ ... ]
}
```

**Auth Success (200/201):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "64abc123def456...",
    "name": "Admin User",
    "email": "admin@waglogy.com",
    "role": "admin"
  }
}
```

**Error Response (400/401/404):**
```json
{
  "status": "fail",
  "message": "Error description here"
}
```

---

## 💰 Payment & Invoice Management

For complete **Payment/Invoice API documentation**, see **[PAYMENT_API.md](PAYMENT_API.md)**

**Quick Reference:**
- POST `/api/v1/payments` - Create payment with auto-generated invoice
- GET `/api/v1/payments` - Get all payments (filtered, paginated)
- GET `/api/v1/payments/:id` - Get payment by ID
- GET `/api/v1/payments/invoice/:invoiceNo` - Get payment by invoice number
- PUT `/api/v1/payments/:id` - Update payment
- DELETE `/api/v1/payments/:id` - Delete payment
- GET `/api/v1/payments/stats/summary` - Get payment statistics

**⚠️ Note:** All payment endpoints require **admin authentication**.

---

## 👥 Client Management

For complete **Client Management API documentation**, see **[CLIENT_API.md](CLIENT_API.md)**

**Quick Reference:**
- POST `/api/v1/clients` - Create new client
- GET `/api/v1/clients` - Get all clients (filtered, paginated)
- GET `/api/v1/clients/:id` - Get client by ID
- PUT `/api/v1/clients/:id` - Update client
- DELETE `/api/v1/clients/:id` - Delete client
- GET `/api/v1/clients/stats/summary` - Get client statistics
- GET `/api/v1/clients/search?query=term` - Search clients

**⚠️ Note:** All client endpoints require **admin authentication**.

---

For detailed documentation, see **POSTMAN_API.md**

