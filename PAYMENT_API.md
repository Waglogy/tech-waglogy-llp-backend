# 💰 Payment & Invoice Management API

## 📍 Base URL
```
http://localhost:5000/api/v1/payments
```

## 🔐 Authentication
All payment endpoints require authentication with an **admin role**.

Include the JWT token in the request headers:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Payment Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoiceNo` | String | Auto-generated | Unique invoice number (Format: INV-YYYY-0001) |
| `client` | String | Yes | Client name (max 100 characters) |
| `description` | String | Yes | Payment description (max 500 characters) |
| `amount` | Number | Yes | Payment amount (cannot be negative) |
| `date` | Date | No | Payment date (defaults to current date) |
| `method` | String | Yes | Payment method (see options below) |
| `status` | String | No | Payment status (defaults to 'pending') |
| `comment` | String | No | Additional comments (max 1000 characters) |

### Payment Methods
- `cash`
- `credit_card`
- `debit_card`
- `bank_transfer`
- `upi`
- `paypal`
- `stripe`
- `other`

### Payment Status Options
- `pending` - Payment is awaiting processing
- `completed` - Payment has been successfully processed
- `failed` - Payment processing failed
- `refunded` - Payment has been refunded
- `cancelled` - Payment has been cancelled

---

## 📌 API Endpoints

### 1. Create Payment (Invoice)

**POST** `/api/v1/payments`

Creates a new payment record with an auto-generated invoice number.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "client": "Tech Solutions Inc",
  "description": "Web development project - Phase 1",
  "amount": 15000,
  "date": "2025-10-11",
  "method": "bank_transfer",
  "status": "completed",
  "comment": "Payment received for initial project phase"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Payment created successfully",
  "data": {
    "_id": "64abc123def456...",
    "invoiceNo": "INV-2025-0001",
    "client": "Tech Solutions Inc",
    "description": "Web development project - Phase 1",
    "amount": 15000,
    "date": "2025-10-11T00:00:00.000Z",
    "method": "bank_transfer",
    "status": "completed",
    "comment": "Payment received for initial project phase",
    "createdBy": "64abc789def012...",
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  }
}
```

---

### 2. Get All Payments

**GET** `/api/v1/payments`

Retrieves all payment records with pagination and filtering.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (`pending`, `completed`, `failed`, `refunded`, `cancelled`)
- `method` - Filter by payment method
- `client` - Filter by client name
- `sort` - Sort fields (e.g., `-amount` for descending amount)
- `fields` - Select specific fields (e.g., `invoiceNo,client,amount`)

**Examples:**
```
GET /api/v1/payments
GET /api/v1/payments?page=2&limit=20
GET /api/v1/payments?status=completed
GET /api/v1/payments?method=bank_transfer
GET /api/v1/payments?sort=-amount,-date
GET /api/v1/payments?fields=invoiceNo,client,amount,status
```

**Success Response (200):**
```json
{
  "status": "success",
  "count": 10,
  "total": 45,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "64abc123def456...",
      "invoiceNo": "INV-2025-0001",
      "client": "Tech Solutions Inc",
      "description": "Web development project - Phase 1",
      "amount": 15000,
      "date": "2025-10-11T00:00:00.000Z",
      "method": "bank_transfer",
      "status": "completed",
      "comment": "Payment received for initial project phase",
      "createdBy": {
        "_id": "64abc789def012...",
        "name": "Admin User",
        "email": "admin@waglogy.com"
      },
      "createdAt": "2025-10-11T10:30:00.000Z",
      "updatedAt": "2025-10-11T10:30:00.000Z"
    },
    // ... more payments
  ]
}
```

---

### 3. Get Single Payment by ID

**GET** `/api/v1/payments/:id`

Retrieves a specific payment by its MongoDB ID.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```
GET /api/v1/payments/64abc123def456789
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "64abc123def456...",
    "invoiceNo": "INV-2025-0001",
    "client": "Tech Solutions Inc",
    "description": "Web development project - Phase 1",
    "amount": 15000,
    "date": "2025-10-11T00:00:00.000Z",
    "method": "bank_transfer",
    "status": "completed",
    "comment": "Payment received for initial project phase",
    "createdBy": {
      "_id": "64abc789def012...",
      "name": "Admin User",
      "email": "admin@waglogy.com"
    },
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "Payment not found"
}
```

---

### 4. Get Payment by Invoice Number

**GET** `/api/v1/payments/invoice/:invoiceNo`

Retrieves a specific payment by its invoice number.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```
GET /api/v1/payments/invoice/INV-2025-0001
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "64abc123def456...",
    "invoiceNo": "INV-2025-0001",
    "client": "Tech Solutions Inc",
    "description": "Web development project - Phase 1",
    "amount": 15000,
    "date": "2025-10-11T00:00:00.000Z",
    "method": "bank_transfer",
    "status": "completed",
    "comment": "Payment received for initial project phase",
    "createdBy": {
      "_id": "64abc789def012...",
      "name": "Admin User",
      "email": "admin@waglogy.com"
    },
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "Payment not found with that invoice number"
}
```

---

### 5. Update Payment

**PUT** `/api/v1/payments/:id`

Updates an existing payment record.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:** (All fields optional)
```json
{
  "status": "completed",
  "comment": "Payment confirmed and processed"
}
```

**Note:** Invoice number (`invoiceNo`) cannot be updated.

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Payment updated successfully",
  "data": {
    "_id": "64abc123def456...",
    "invoiceNo": "INV-2025-0001",
    "client": "Tech Solutions Inc",
    "description": "Web development project - Phase 1",
    "amount": 15000,
    "date": "2025-10-11T00:00:00.000Z",
    "method": "bank_transfer",
    "status": "completed",
    "comment": "Payment confirmed and processed",
    "createdBy": "64abc789def012...",
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T11:45:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "Payment not found"
}
```

---

### 6. Delete Payment

**DELETE** `/api/v1/payments/:id`

Deletes a payment record.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```
DELETE /api/v1/payments/64abc123def456789
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Payment deleted successfully",
  "data": null
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "Payment not found"
}
```

---

### 7. Get Payment Statistics

**GET** `/api/v1/payments/stats/summary`

Retrieves statistical summary of all payments.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "byStatus": [
      {
        "_id": "completed",
        "totalAmount": 125000,
        "count": 15,
        "avgAmount": 8333.33
      },
      {
        "_id": "pending",
        "totalAmount": 45000,
        "count": 8,
        "avgAmount": 5625
      },
      {
        "_id": "failed",
        "totalAmount": 12000,
        "count": 3,
        "avgAmount": 4000
      }
    ],
    "overall": {
      "totalPayments": 26,
      "totalAmount": 182000,
      "avgAmount": 7000
    }
  }
}
```

---

## 🧪 Postman Test Examples

### Test 1: Create Payment
```
Method: POST
URL: http://localhost:5000/api/v1/payments
Headers: 
  Authorization: Bearer <your_admin_token>
  Content-Type: application/json
Body:
{
  "client": "ABC Corporation",
  "description": "Mobile app development - Monthly retainer",
  "amount": 25000,
  "method": "credit_card",
  "status": "pending",
  "comment": "Awaiting payment confirmation"
}
```

### Test 2: Get All Payments with Filters
```
Method: GET
URL: http://localhost:5000/api/v1/payments?status=completed&page=1&limit=10
Headers: 
  Authorization: Bearer <your_admin_token>
```

### Test 3: Get Payment by Invoice Number
```
Method: GET
URL: http://localhost:5000/api/v1/payments/invoice/INV-2025-0001
Headers: 
  Authorization: Bearer <your_admin_token>
```

### Test 4: Update Payment Status
```
Method: PUT
URL: http://localhost:5000/api/v1/payments/64abc123def456789
Headers: 
  Authorization: Bearer <your_admin_token>
  Content-Type: application/json
Body:
{
  "status": "completed",
  "comment": "Payment verified and completed"
}
```

### Test 5: Get Payment Statistics
```
Method: GET
URL: http://localhost:5000/api/v1/payments/stats/summary
Headers: 
  Authorization: Bearer <your_admin_token>
```

### Test 6: Delete Payment
```
Method: DELETE
URL: http://localhost:5000/api/v1/payments/64abc123def456789
Headers: 
  Authorization: Bearer <your_admin_token>
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "status": "fail",
  "message": "Validation error",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be a number"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "status": "fail",
  "message": "User role 'user' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "message": "Payment not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Server error message"
}
```

---

## 📝 Important Notes

1. **Auto-Generated Invoice Numbers**: Invoice numbers are automatically generated in the format `INV-YYYY-NNNN` where:
   - `YYYY` is the current year
   - `NNNN` is a 4-digit sequential number (e.g., 0001, 0002, etc.)
   - Example: `INV-2025-0001`, `INV-2025-0002`

2. **Admin Access Only**: All payment endpoints require admin authentication. Regular users cannot access these endpoints.

3. **Invoice Number Protection**: Once created, invoice numbers cannot be modified to maintain data integrity.

4. **Date Handling**: If no date is provided, the current date is automatically set.

5. **Pagination**: Use `page` and `limit` query parameters for efficient data retrieval.

6. **Filtering & Sorting**: Support for complex queries using query parameters for better data management.

7. **Audit Trail**: Each payment record includes `createdBy` field linking to the admin who created it.

---

## 🎯 Quick Start Workflow

1. **Login as Admin**
   ```
   POST /api/v1/auth/login
   ```

2. **Copy the JWT token** from the login response

3. **Create a Payment**
   ```
   POST /api/v1/payments
   (Include token in Authorization header)
   ```

4. **View All Payments**
   ```
   GET /api/v1/payments
   ```

5. **Update Payment Status**
   ```
   PUT /api/v1/payments/:id
   ```

6. **Check Statistics**
   ```
   GET /api/v1/payments/stats/summary
   ```

---

For general API information, see **API_ENDPOINTS.md**

