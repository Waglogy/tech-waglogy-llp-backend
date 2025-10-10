# 🚀 Vercel Deployment Guide - Tech Waglogy LLP Backend

## ✅ Files Configured

Your backend is now configured for Vercel deployment with these files:
- ✅ `index.js` - Vercel entry point
- ✅ `vercel.json` - Vercel configuration
- ✅ `src/app.js` - Updated CORS for production
- ✅ `src/config/database.js` - Serverless-optimized DB connection

---

## 📝 Environment Variables in Vercel

You **MUST** add these environment variables in your Vercel dashboard:

### Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://waglogyin_admin:3qoZKD8r6FXIK8fp@waglogy.szgvjai.mongodb.net/?retryWrites=true&w=majority&appName=waglogy
JWT_SECRET=waglogy-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

---

## 🔄 Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Tech Waglogy Backend"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy to Vercel

**Option A: Using Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables (see above)
4. Click "Deploy"

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

---

## 🧪 Testing After Deployment

Once deployed, your URL will be something like:
```
https://your-project-name.vercel.app
```

### Test Endpoints:

**Health Check:**
```bash
curl https://your-project-name.vercel.app/health
```

**Submit Query:**
```bash
curl -X POST https://your-project-name.vercel.app/api/v1/queries \
  -H "Content-Type: application/json" \
  -d '{"message": "Test query from Vercel"}'
```

**Submit Contact:**
```bash
curl -X POST https://your-project-name.vercel.app/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "organizationName": "Test Org",
    "budgetRange": "Less than $5,000",
    "projectDetails": "Test project"
  }'
```

**Get All Queries:**
```bash
curl https://your-project-name.vercel.app/api/v1/queries
```

---

## ⚠️ Important Notes

### 1. CORS Configuration
Currently set to allow all origins (`origin: true`). 

**For Production Security:**
Update `src/app.js`:
```javascript
const corsOptions = {
  origin: 'https://your-frontend-domain.com',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 2. MongoDB Atlas IP Whitelist
Make sure to whitelist Vercel's IP addresses in MongoDB Atlas:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for Vercel

### 3. Cold Starts
Vercel serverless functions have cold starts. First request might be slow (2-3 seconds).

### 4. Function Timeout
Free tier has 10-second timeout. Upgrade if needed for longer operations.

---

## 🐛 Troubleshooting

### Error: FUNCTION_INVOCATION_FAILED

**Solution:** Make sure all environment variables are set in Vercel dashboard.

### Error: MongoDB Connection Timeout

**Solutions:**
1. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
2. Verify MONGODB_URI is correct in Vercel environment variables
3. Check MongoDB Atlas cluster is not paused

### Error: CORS Issues

**Solution:** Update CORS_ORIGIN in Vercel environment variables to your frontend URL:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Error: 404 Not Found

**Solution:** Make sure `vercel.json` routes are correct and redeploy.

---

## 📊 Monitoring

Check your deployment logs:
```bash
vercel logs YOUR_DEPLOYMENT_URL
```

Or view in Vercel Dashboard → Your Project → Deployments → View Function Logs

---

## 🔄 Update Deployment

When you make changes:
```bash
git add .
git commit -m "Your changes"
git push

# Vercel will auto-deploy from GitHub
# Or manually: vercel --prod
```

---

## ✨ Your API Endpoints

Once deployed:
- Health: `https://your-app.vercel.app/health`
- Queries: `https://your-app.vercel.app/api/v1/queries`
- Contacts: `https://your-app.vercel.app/api/v1/contacts`
- Auth: `https://your-app.vercel.app/api/v1/auth`

---

Happy Deploying! 🚀

