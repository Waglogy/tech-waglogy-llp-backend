# 📮 Postman API Testing Guide - Tech Waglogy LLP

## Base URL
```
http://localhost:5000/api/v1
```

---

## 🔍 Query Form API

### 1. Submit a Query (POST)
**Endpoint:** `POST /api/v1/queries`

**Request Body:**
```json
{
  "message": "I need help with web development services"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Query submitted successfully",
  "data": {
    "_id": "6543210abcdef123456789",
    "message": "I need help with web development services",
    "status": "new",
    "ipAddress": "::1",
    "createdAt": "2024-10-10T10:30:00.000Z",
    "updatedAt": "2024-10-10T10:30:00.000Z"
  }
}
```

### 2. Get All Queries (GET)
**Endpoint:** `GET /api/v1/queries`

**Query Parameters (Optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (new, read, responded, closed)

**Example:** `GET /api/v1/queries?page=1&limit=10&status=new`

**Response (200 OK):**
```json
{
  "status": "success",
  "count": 5,
  "totalPages": 1,
  "currentPage": 1,
  "totalQueries": 5,
  "data": [
    {
      "_id": "6543210abcdef123456789",
      "message": "I need help with web development services",
      "status": "new",
      "ipAddress": "::1",
      "createdAt": "2024-10-10T10:30:00.000Z",
      "updatedAt": "2024-10-10T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Single Query (GET)
**Endpoint:** `GET /api/v1/queries/:id`

**Example:** `GET /api/v1/queries/6543210abcdef123456789`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "_id": "6543210abcdef123456789",
    "message": "I need help with web development services",
    "status": "new",
    "ipAddress": "::1",
    "createdAt": "2024-10-10T10:30:00.000Z",
    "updatedAt": "2024-10-10T10:30:00.000Z"
  }
}
```

### 4. Update Query Status (PUT)
**Endpoint:** `PUT /api/v1/queries/:id`

**Request Body:**
```json
{
  "status": "read"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Query updated successfully",
  "data": {
    "_id": "6543210abcdef123456789",
    "message": "I need help with web development services",
    "status": "read",
    "ipAddress": "::1",
    "createdAt": "2024-10-10T10:30:00.000Z",
    "updatedAt": "2024-10-10T10:35:00.000Z"
  }
}
```

### 5. Delete Query (DELETE)
**Endpoint:** `DELETE /api/v1/queries/:id`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Query deleted successfully"
}
```

---

## 📧 Contact Form API

### 1. Submit Contact Form (POST)
**Endpoint:** `POST /api/v1/contacts`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1 (555) 123-4567",
  "organizationName": "Tech Solutions Inc",
  "budgetRange": "$10,000 - $25,000",
  "projectDetails": "We need a complete e-commerce platform with payment integration, inventory management, and analytics dashboard. The project should be completed within 3 months."
}
```

**Budget Range Options:**
- `Less than $5,000`
- `$5,000 - $10,000`
- `$10,000 - $25,000`
- `$25,000 - $50,000`
- `$50,000 - $100,000`
- `More than $100,000`

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Contact form submitted successfully",
  "data": {
    "_id": "6543210abcdef987654321",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "organizationName": "Tech Solutions Inc",
    "budgetRange": "$10,000 - $25,000",
    "projectDetails": "We need a complete e-commerce platform...",
    "status": "new",
    "ipAddress": "::1",
    "createdAt": "2024-10-10T10:30:00.000Z",
    "updatedAt": "2024-10-10T10:30:00.000Z"
  }
}
```

### 2. Get All Contacts (GET)
**Endpoint:** `GET /api/v1/contacts`

**Query Parameters (Optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (new, in-progress, contacted, qualified, closed)
- `budgetRange` - Filter by budget range

**Example:** `GET /api/v1/contacts?page=1&limit=10&status=new&budgetRange=$10,000 - $25,000`

**Response (200 OK):**
```json
{
  "status": "success",
  "count": 3,
  "totalPages": 1,
  "currentPage": 1,
  "totalContacts": 3,
  "data": [
    {
      "_id": "6543210abcdef987654321",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1 (555) 123-4567",
      "organizationName": "Tech Solutions Inc",
      "budgetRange": "$10,000 - $25,000",
      "projectDetails": "We need a complete e-commerce platform...",
      "status": "new",
      "ipAddress": "::1",
      "createdAt": "2024-10-10T10:30:00.000Z",
      "updatedAt": "2024-10-10T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Single Contact (GET)
**Endpoint:** `GET /api/v1/contacts/:id`

**Example:** `GET /api/v1/contacts/6543210abcdef987654321`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "_id": "6543210abcdef987654321",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "organizationName": "Tech Solutions Inc",
    "budgetRange": "$10,000 - $25,000",
    "projectDetails": "We need a complete e-commerce platform...",
    "status": "new",
    "ipAddress": "::1",
    "createdAt": "2024-10-10T10:30:00.000Z",
    "updatedAt": "2024-10-10T10:30:00.000Z"
  }
}
```

### 4. Update Contact Status (PUT)
**Endpoint:** `PUT /api/v1/contacts/:id`

**Request Body:**
```json
{
  "status": "contacted"
}
```

**Status Options:**
- `new`
- `in-progress`
- `contacted`
- `qualified`
- `closed`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Contact updated successfully",
  "data": {
    "_id": "6543210abcdef987654321",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "organizationName": "Tech Solutions Inc",
    "budgetRange": "$10,000 - $25,000",
    "projectDetails": "We need a complete e-commerce platform...",
    "status": "contacted",
    "ipAddress": "::1",
    "createdAt": "2024-10-10T10:30:00.000Z",
    "updatedAt": "2024-10-10T10:35:00.000Z"
  }
}
```

### 5. Delete Contact (DELETE)
**Endpoint:** `DELETE /api/v1/contacts/:id`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Contact deleted successfully"
}
```

---

## 🚦 Health Check

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-10-10T10:30:00.000Z"
}
```

---

## 🧪 Quick Postman Setup

### 1. Create Environment
- **Variable:** `base_url`
- **Value:** `http://localhost:5000/api/v1`

### 2. Headers for All Requests
```
Content-Type: application/json
```

### 3. Test Query Form
```bash
# In Postman
POST {{base_url}}/queries

Body (raw JSON):
{
  "message": "I need a mobile app development quote"
}
```

### 4. Test Contact Form
```bash
# In Postman
POST {{base_url}}/contacts

Body (raw JSON):
{
  "fullName": "Jane Smith",
  "email": "jane@company.com",
  "phone": "+1-555-999-8888",
  "organizationName": "ABC Corporation",
  "budgetRange": "$25,000 - $50,000",
  "projectDetails": "Looking to build a SaaS platform for project management"
}
```

---

## ⚠️ Validation Errors

If validation fails, you'll get a 400 error:

```json
{
  "status": "fail",
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

## 📊 Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (Validation Error)
- `404` - Not Found
- `500` - Server Error

---

## 🎯 cURL Examples

### Submit Query
```bash
curl -X POST http://localhost:5000/api/v1/queries \
  -H "Content-Type: application/json" \
  -d '{"message": "I need web development services"}'
```

### Get All Queries
```bash
curl http://localhost:5000/api/v1/queries
```

### Submit Contact Form
```bash
curl -X POST http://localhost:5000/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "organizationName": "Tech Company",
    "budgetRange": "$10,000 - $25,000",
    "projectDetails": "Need a website"
  }'
```

### Get All Contacts
```bash
curl http://localhost:5000/api/v1/contacts
```

---

Happy Testing! 🚀

