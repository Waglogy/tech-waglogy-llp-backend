const app = require('./src/app');
const connectDB = require('./src/config/database');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to database (with caching for serverless)
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  cachedDb = await connectDB();
  return cachedDb;
}

// Initialize database connection
connectToDatabase();

// Export the Express app for Vercel
module.exports = app;

