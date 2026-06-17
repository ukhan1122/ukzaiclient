// src/config.js

// For local development: http://localhost:5001
// For production (Vercel): https://ukzai.onrender.com
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ukzai.onrender.com'  // Production URL
  : (process.env.REACT_APP_API_URL || 'http://localhost:5001');  // Local URL

export default API_URL;