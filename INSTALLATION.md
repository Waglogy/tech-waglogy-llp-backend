# 🚀 Installation Guide - Tech Waglogy LLP Backend

## 📋 Prerequisites

Before you start, make sure you have these installed on your system:

### 1. **Node.js** (v18 or higher)
Check if you have Node.js installed:
```bash
node --version
```

If not installed, download from: https://nodejs.org/

**Recommended:** Use Node.js v18 or v20 LTS

### 2. **npm** (comes with Node.js)
Check npm version:
```bash
npm --version
```

### 3. **MongoDB Atlas Account** (Already configured ✅)
You're using MongoDB Atlas cloud database, so no local MongoDB installation needed!

Your connection string is already in `.env`:
```
mongodb+srv://waglogyin_admin:3qoZKD8r6FXIK8fp@waglogy.szgvjai.mongodb.net/
```

---

## 📦 Step-by-Step Installation

### Step 1: Navigate to Project Directory
```bash
cd /Users/bhupes/Desktop/code/tech-waglogy-llp-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **morgan** - HTTP logging
- **compression** - Response compression
- **cookie-parser** - Cookie parsing
- **nodemon** - Auto-restart (dev)
- **eslint** - Code linting (dev)
- **jest** - Testing (dev)

### Step 3: Verify .env File
Your `.env` file should already exist with:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://waglogyin_admin:3qoZKD8r6FXIK8fp@waglogy.szgvjai.mongodb.net/?retryWrites=true&w=majority&appName=waglogy
JWT_SECRET=waglogy-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CORS_ORIGIN=http://localhost:3000
```

✅ Already configured!

### Step 4: Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

---

## ✅ Verification

### 1. Check if server is running
You should see:
```
✅ MongoDB Connected: waglogy.szgvjai.mongodb.net
🚀 Server running in development mode on port 5000
```

### 2. Test Health Check
Open browser or use curl:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-10-10T..."
}
```

### 3. Test API Endpoints
```bash
# Test Query Form
curl -X POST http://localhost:5000/api/v1/queries \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message"}'

# Test Contact Form
curl -X POST http://localhost:5000/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "organizationName": "Test Org",
    "budgetRange": "$10,000 - $25,000",
    "projectDetails": "Test project"
  }'
```

---

## 🔧 Troubleshooting

### Issue 1: Port 5000 already in use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill the process using port 5000
lsof -i :5000
kill -9 <PID>

# OR change port in .env file
PORT=3000
```

### Issue 2: MongoDB Connection Error
**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Verify MongoDB Atlas credentials in `.env`
- Check if IP address is whitelisted in MongoDB Atlas
- Ensure network access is allowed

### Issue 3: Module not found
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: nodemon not found
**Error:** `command not found: nodemon`

**Solution:**
```bash
# Install nodemon globally
npm install -g nodemon

# OR use npx
npx nodemon src/server.js
```

---

## 📝 Available Scripts

```bash
# Start development server (auto-restart on changes)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Check code for errors
npm run lint

# Fix linting errors
npm run lint:fix
```

---

## 🌐 Access URLs

Once running, your API will be available at:

- **Base URL:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **API Base:** http://localhost:5000/api/v1
- **Queries:** http://localhost:5000/api/v1/queries
- **Contacts:** http://localhost:5000/api/v1/contacts

---

## 🎯 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Verify `.env` file exists
3. ✅ Start server (`npm run dev`)
4. ✅ Test endpoints in Postman
5. ✅ Integrate with your frontend

---

## 📚 Additional Tools (Optional)

### Postman
Download: https://www.postman.com/downloads/

Best for testing APIs visually.

### MongoDB Compass (Optional)
Download: https://www.mongodb.com/products/compass

Connect to your MongoDB Atlas database to view data:
```
mongodb+srv://waglogyin_admin:3qoZKD8r6FXIK8fp@waglogy.szgvjai.mongodb.net/
```

---

## 🔒 Security Notes

- ⚠️ Never commit `.env` file to Git (already in `.gitignore`)
- ⚠️ Change `JWT_SECRET` before production deployment
- ⚠️ Keep your MongoDB credentials secure
- ⚠️ Update CORS_ORIGIN to your frontend domain in production

---

## 💡 Quick Start Command

Just run these three commands:
```bash
cd /Users/bhupes/Desktop/code/tech-waglogy-llp-backend
npm install
npm run dev
```

That's it! Your backend will be running! 🚀

