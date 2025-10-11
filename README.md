# Tech Waglogy LLP - Backend API

A robust and scalable backend API built with Express.js, Node.js, and MongoDB.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **MongoDB** with Mongoose - NoSQL database with ODM
- **JWT Authentication** - Secure token-based authentication
- **Role-based Authorization** - User roles and permissions
- **Input Validation** - Using express-validator
- **Error Handling** - Centralized error handling middleware
- **Security** - Helmet, CORS, rate limiting
- **Logging** - Morgan for HTTP request logging
- **Environment Configuration** - Using dotenv

## 📁 Project Structure

```
tech-waglogy-llp-backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # MongoDB connection
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   ├── clientController.js
│   │   ├── contactController.js
│   │   ├── paymentController.js
│   │   └── queryController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication & authorization
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── asyncHandler.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Blog.js
│   │   ├── Client.js
│   │   ├── Contact.js
│   │   ├── Payment.js
│   │   └── Query.js
│   ├── routes/          # Route definitions
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── blogRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── queryRoutes.js
│   ├── utils/           # Utility functions
│   │   ├── ApiResponse.js
│   │   └── logger.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── API_ENDPOINTS.md     # General API documentation
├── BLOG_API.md          # Blog API documentation
├── CLIENT_API.md        # Client API documentation
├── PAYMENT_API.md       # Payment API documentation
├── .env.example         # Environment variables example
├── .eslintrc.json       # ESLint configuration
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Steps

1. **Clone or navigate to the project:**
   ```bash
   cd tech-waglogy-llp-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and update the values:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tech-waglogy-db
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=7d
   JWT_COOKIE_EXPIRE=7
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB:**
   - For local MongoDB:
     ```bash
     mongod
     ```
   - For MongoDB Atlas: Update `MONGODB_URI` in `.env` with your Atlas connection string

5. **Run the application:**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

The server should now be running on `http://localhost:5000`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login user | Public |
| GET | `/api/v1/auth/me` | Get current user | Private |
| POST | `/api/v1/auth/logout` | Logout user | Private |
| PUT | `/api/v1/auth/updatedetails` | Update user details | Private |
| PUT | `/api/v1/auth/updatepassword` | Update password | Private |

### Blogs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/blogs` | Get all published blogs | Public |
| GET | `/api/v1/blogs/:id` | Get single blog by ID | Public |
| GET | `/api/v1/blogs/slug/:slug` | Get single blog by slug | Public |
| POST | `/api/v1/blogs` | Create new blog | Private |
| PUT | `/api/v1/blogs/:id` | Update blog | Private |
| DELETE | `/api/v1/blogs/:id` | Delete blog | Private |
| PATCH | `/api/v1/blogs/:id/publish` | Toggle publish status | Private |
| GET | `/api/v1/blogs/stats/summary` | Get blog statistics | Private |

**📖 For detailed Blog API documentation, see [BLOG_API.md](./BLOG_API.md)**

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/health` | Server health status | Public |

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in your requests:

**Header:**
```
Authorization: Bearer <your-token>
```

**Or Cookie:**
```
token=<your-token>
```

## 📝 Example Requests

### Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Use Protected Routes
```bash
# Add your custom protected routes here
# Example:
POST /api/v1/your-resource
Authorization: Bearer <token>
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

## 🧪 Testing

```bash
npm test
```

## 🔍 Linting

```bash
# Check for errors
npm run lint

# Fix errors automatically
npm run lint:fix
```

## 🛡️ Security Features

- **Helmet** - Sets various HTTP headers for security
- **CORS** - Cross-Origin Resource Sharing enabled
- **Rate Limiting** - Prevents brute-force attacks
- **Input Validation** - Validates and sanitizes user input
- **JWT** - Secure token-based authentication
- **Password Hashing** - Using bcrypt

## 📦 Dependencies

### Production
- express - Web framework
- mongoose - MongoDB ODM
- dotenv - Environment variables
- cors - CORS middleware
- helmet - Security headers
- express-rate-limit - Rate limiting
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- express-validator - Input validation
- morgan - HTTP logging
- compression - Response compression
- cookie-parser - Cookie parsing

### Development
- nodemon - Auto-restart server
- eslint - Code linting
- jest - Testing framework
- supertest - HTTP testing

## 🚀 Deployment

### Environment Variables for Production

Make sure to set these in your production environment:
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Update `MONGODB_URI` to your production database
- Configure `CORS_ORIGIN` to your frontend URL

### PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start src/server.js --name "waglogy-backend"
pm2 save
pm2 startup
```

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📞 Support

For support, email support@waglogy.com or create an issue in the repository.

