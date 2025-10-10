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

---

For detailed documentation, see **POSTMAN_API.md**

