# 🚀 Quick Start Guide

## Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Create a `.env` file in the root directory:
```bash
# Copy this content to .env file
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tech-waglogy-db
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Run the Server
```bash
# Make sure MongoDB is running first
# Then start the development server
npm run dev
```

Your server will be running at `http://localhost:5000`

---

## 🧪 Test the API

### 1. Check Health
```bash
curl http://localhost:5000/health
```

### 2. Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the token from the response!

### 4. Test Protected Routes
```bash
# Add your own resources and test them here
# Example for creating a resource:
curl -X POST http://localhost:5000/api/v1/your-resource \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "field1": "value1",
    "field2": "value2"
  }'
```

---

## 📝 Next Steps

1. **Customize Models**: Edit files in `src/models/` to match your data structure
2. **Add Routes**: Create new routes in `src/routes/`
3. **Build Controllers**: Add business logic in `src/controllers/`
4. **Add Validation**: Use express-validator in your routes
5. **Deploy**: Follow the deployment guide in README.md

---

## 🔧 Common Commands

```bash
# Development with auto-reload
npm run dev

# Production mode
npm start

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## 📚 Project Structure

```
src/
├── config/          # Database and other configs
├── controllers/     # Business logic
├── middleware/      # Custom middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── utils/           # Helper functions
├── app.js           # Express app
└── server.js        # Entry point
```

---

## ⚠️ Important Notes

- Make sure MongoDB is running before starting the server
- Never commit the `.env` file to version control
- Change the `JWT_SECRET` to a strong random string in production
- For MongoDB Atlas, update `MONGODB_URI` with your connection string

---

## 🆘 Need Help?

Check the full documentation in [README.md](./README.md)

