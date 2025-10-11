# 👥 Client Management API

## 📍 Base URL
```
http://localhost:5000/api/v1/clients
```

## 🔐 Authentication
All client endpoints require authentication with an **admin role**.

Include the JWT token in the request headers:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Client Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company` | String | Yes | Company name (max 200 characters) |
| `contactPerson` | String | Yes | Contact person name (max 100 characters) |
| `email` | String | No | Email address |
| `phone` | String | No | Phone number (max 20 characters) |
| `service` | String | Yes | Service provided (max 200 characters) |
| `startDate` | Date | Yes | Project start date (defaults to current date) |
| `endDate` | Date | No | Project end date |
| `revenue` | Number | Yes | Revenue amount (cannot be negative) |
| `status` | String | No | Client status (defaults to 'active') |
| `address` | String | No | Client address (max 500 characters) |
| `notes` | String | No | Additional notes (max 1000 characters) |

### Status Options
- `active` - Active client
- `inactive` - Inactive client
- `pending` - Pending client
- `completed` - Completed project
- `on-hold` - Project on hold
- `cancelled` - Project cancelled

---

## 📌 API Endpoints

### 1. Create Client

**POST** `/api/v1/clients`

Creates a new client record.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "company": "TechCorp Solutions",
  "contactPerson": "John Smith",
  "email": "john.smith@techcorp.com",
  "phone": "+1-555-123-4567",
  "service": "Web Development - E-commerce Platform",
  "startDate": "2025-10-01",
  "revenue": 75000,
  "status": "active",
  "address": "123 Tech Street, Silicon Valley, CA 94025",
  "notes": "Client requires monthly progress reports"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Client created successfully",
  "data": {
    "_id": "64abc123def456...",
    "company": "TechCorp Solutions",
    "contactPerson": "John Smith",
    "email": "john.smith@techcorp.com",
    "phone": "+1-555-123-4567",
    "service": "Web Development - E-commerce Platform",
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": null,
    "revenue": 75000,
    "status": "active",
    "address": "123 Tech Street, Silicon Valley, CA 94025",
    "notes": "Client requires monthly progress reports",
    "createdBy": "64abc789def012...",
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z",
    "duration": 10
  }
}
```

---

### 2. Get All Clients

**GET** `/api/v1/clients`

Retrieves all client records with pagination and filtering.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (`active`, `inactive`, `pending`, `completed`, `on-hold`, `cancelled`)
- `company` - Filter by company name
- `service` - Filter by service
- `sort` - Sort fields (e.g., `-revenue` for descending revenue, `-startDate`)
- `fields` - Select specific fields (e.g., `company,contactPerson,revenue,status`)

**Examples:**
```
GET /api/v1/clients
GET /api/v1/clients?page=2&limit=20
GET /api/v1/clients?status=active
GET /api/v1/clients?sort=-revenue,-startDate
GET /api/v1/clients?fields=company,contactPerson,revenue,status
GET /api/v1/clients?status=active&sort=-revenue&limit=5
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
      "company": "TechCorp Solutions",
      "contactPerson": "John Smith",
      "email": "john.smith@techcorp.com",
      "phone": "+1-555-123-4567",
      "service": "Web Development - E-commerce Platform",
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": null,
      "revenue": 75000,
      "status": "active",
      "address": "123 Tech Street, Silicon Valley, CA 94025",
      "notes": "Client requires monthly progress reports",
      "createdBy": {
        "_id": "64abc789def012...",
        "name": "Admin User",
        "email": "admin@waglogy.com"
      },
      "createdAt": "2025-10-11T10:30:00.000Z",
      "updatedAt": "2025-10-11T10:30:00.000Z",
      "duration": 10
    },
    // ... more clients
  ]
}
```

---

### 3. Get Single Client by ID

**GET** `/api/v1/clients/:id`

Retrieves a specific client by its MongoDB ID.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```
GET /api/v1/clients/64abc123def456789
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "64abc123def456...",
    "company": "TechCorp Solutions",
    "contactPerson": "John Smith",
    "email": "john.smith@techcorp.com",
    "phone": "+1-555-123-4567",
    "service": "Web Development - E-commerce Platform",
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": null,
    "revenue": 75000,
    "status": "active",
    "address": "123 Tech Street, Silicon Valley, CA 94025",
    "notes": "Client requires monthly progress reports",
    "createdBy": {
      "_id": "64abc789def012...",
      "name": "Admin User",
      "email": "admin@waglogy.com"
    },
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z",
    "duration": 10
  }
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "Client not found"
}
```

---

### 4. Update Client

**PUT** `/api/v1/clients/:id`

Updates an existing client record.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:** (All fields optional)
```json
{
  "status": "completed",
  "endDate": "2025-12-15",
  "revenue": 85000,
  "notes": "Project completed successfully. Client very satisfied."
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Client updated successfully",
  "data": {
    "_id": "64abc123def456...",
    "company": "TechCorp Solutions",
    "contactPerson": "John Smith",
    "email": "john.smith@techcorp.com",
    "phone": "+1-555-123-4567",
    "service": "Web Development - E-commerce Platform",
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": "2025-12-15T00:00:00.000Z",
    "revenue": 85000,
    "status": "completed",
    "address": "123 Tech Street, Silicon Valley, CA 94025",
    "notes": "Project completed successfully. Client very satisfied.",
    "createdBy": "64abc789def012...",
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-12-16T14:20:00.000Z",
    "duration": 75
  }
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "Client not found"
}
```

---

### 5. Delete Client

**DELETE** `/api/v1/clients/:id`

Deletes a client record.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```
DELETE /api/v1/clients/64abc123def456789
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Client deleted successfully",
  "data": null
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "Client not found"
}
```

---

### 6. Get Client Statistics

**GET** `/api/v1/clients/stats/summary`

Retrieves statistical summary of all clients.

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
        "_id": "active",
        "totalRevenue": 450000,
        "count": 12,
        "avgRevenue": 37500
      },
      {
        "_id": "completed",
        "totalRevenue": 320000,
        "count": 8,
        "avgRevenue": 40000
      },
      {
        "_id": "pending",
        "totalRevenue": 85000,
        "count": 3,
        "avgRevenue": 28333.33
      }
    ],
    "overall": {
      "totalClients": 23,
      "totalRevenue": 855000,
      "avgRevenue": 37173.91
    },
    "topClients": [
      {
        "_id": "64abc123def456...",
        "company": "Enterprise Corp",
        "contactPerson": "Jane Doe",
        "revenue": 150000,
        "status": "active",
        "service": "Enterprise Software Development"
      },
      {
        "_id": "64abc456def789...",
        "company": "Global Tech Inc",
        "contactPerson": "Mike Johnson",
        "revenue": 125000,
        "status": "active",
        "service": "Cloud Infrastructure Setup"
      }
      // ... top 5 clients by revenue
    ]
  }
}
```

---

### 7. Search Clients

**GET** `/api/v1/clients/search`

Search clients by company name, contact person, service, or email.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `query` - Search term (required)

**Examples:**
```
GET /api/v1/clients/search?query=TechCorp
GET /api/v1/clients/search?query=john
GET /api/v1/clients/search?query=web%20development
```

**Success Response (200):**
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "_id": "64abc123def456...",
      "company": "TechCorp Solutions",
      "contactPerson": "John Smith",
      "email": "john.smith@techcorp.com",
      "phone": "+1-555-123-4567",
      "service": "Web Development - E-commerce Platform",
      "startDate": "2025-10-01T00:00:00.000Z",
      "revenue": 75000,
      "status": "active"
    },
    // ... more matching clients (max 20)
  ]
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "message": "Please provide a search query"
}
```

---

## 🧪 Postman Test Examples

### Test 1: Create Client
```
Method: POST
URL: http://localhost:5000/api/v1/clients
Headers: 
  Authorization: Bearer <your_admin_token>
  Content-Type: application/json
Body:
{
  "company": "Innovative Startups Ltd",
  "contactPerson": "Sarah Williams",
  "email": "sarah@innovativestartups.com",
  "phone": "+1-555-987-6543",
  "service": "Mobile App Development - iOS & Android",
  "startDate": "2025-11-01",
  "revenue": 95000,
  "status": "active",
  "address": "456 Innovation Drive, San Francisco, CA 94105",
  "notes": "Client prefers bi-weekly sprint reviews"
}
```

### Test 2: Get All Clients with Filters
```
Method: GET
URL: http://localhost:5000/api/v1/clients?status=active&sort=-revenue&limit=10
Headers: 
  Authorization: Bearer <your_admin_token>
```

### Test 3: Get Single Client
```
Method: GET
URL: http://localhost:5000/api/v1/clients/64abc123def456789
Headers: 
  Authorization: Bearer <your_admin_token>
```

### Test 4: Update Client Status
```
Method: PUT
URL: http://localhost:5000/api/v1/clients/64abc123def456789
Headers: 
  Authorization: Bearer <your_admin_token>
  Content-Type: application/json
Body:
{
  "status": "on-hold",
  "notes": "Project paused due to client request. Will resume in Q2."
}
```

### Test 5: Search Clients
```
Method: GET
URL: http://localhost:5000/api/v1/clients/search?query=web%20development
Headers: 
  Authorization: Bearer <your_admin_token>
```

### Test 6: Get Client Statistics
```
Method: GET
URL: http://localhost:5000/api/v1/clients/stats/summary
Headers: 
  Authorization: Bearer <your_admin_token>
```

### Test 7: Delete Client
```
Method: DELETE
URL: http://localhost:5000/api/v1/clients/64abc123def456789
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
      "field": "revenue",
      "message": "Revenue must be a number"
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
  "message": "Client not found"
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

1. **Admin Access Only**: All client endpoints require admin authentication. Regular users cannot access these endpoints.

2. **Duration Calculation**: The `duration` field is automatically calculated based on:
   - If `endDate` exists: difference between `endDate` and `startDate`
   - If no `endDate`: difference between current date and `startDate`
   - Result is in days

3. **Date Handling**: If no `startDate` is provided, the current date is automatically set.

4. **Status Management**: Use appropriate status values to track client lifecycle:
   - `active` - Ongoing projects
   - `pending` - Awaiting project start
   - `on-hold` - Temporarily paused
   - `completed` - Successfully finished
   - `cancelled` - Project terminated
   - `inactive` - No longer engaged

5. **Search Functionality**: The search endpoint performs case-insensitive searches across:
   - Company name
   - Contact person
   - Service description
   - Email address

6. **Pagination**: Use `page` and `limit` query parameters for efficient data retrieval, especially useful for large client databases.

7. **Filtering & Sorting**: Support for complex queries using query parameters for better data management.

8. **Revenue Tracking**: Revenue must be a positive number. Track actual revenue or projected revenue based on your business needs.

9. **Audit Trail**: Each client record includes `createdBy` field linking to the admin who created it.

10. **Top Clients**: The statistics endpoint includes top 5 clients by revenue for quick insights.

---

## 🎯 Quick Start Workflow

1. **Login as Admin**
   ```
   POST /api/v1/auth/login
   ```

2. **Copy the JWT token** from the login response

3. **Create a Client**
   ```
   POST /api/v1/clients
   (Include token in Authorization header)
   ```

4. **View All Clients**
   ```
   GET /api/v1/clients
   ```

5. **Update Client Status**
   ```
   PUT /api/v1/clients/:id
   ```

6. **Search Clients**
   ```
   GET /api/v1/clients/search?query=searchterm
   ```

7. **Check Statistics**
   ```
   GET /api/v1/clients/stats/summary
   ```

---

## 💡 Use Cases

### Track Active Projects
```
GET /api/v1/clients?status=active&sort=-startDate
```

### Find High-Value Clients
```
GET /api/v1/clients?sort=-revenue&limit=10
```

### Monitor Recent Clients
```
GET /api/v1/clients?sort=-createdAt&limit=20
```

### View Completed Projects
```
GET /api/v1/clients?status=completed&sort=-endDate
```

### Search by Service Type
```
GET /api/v1/clients/search?query=web%20development
```

---

For general API information, see **API_ENDPOINTS.md**  
For payment/invoice management, see **PAYMENT_API.md**

