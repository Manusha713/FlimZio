const express = require('express');
const cors = require('cors');
require('dotenv').config();

const movieRoutes = require('./routes/movieRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Movie Discovery Backend is operational.'
  });
});

// API Routes
app.use('/api/movies', movieRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  const statusCode = err.response?.status || 500;
  const message = err.response?.data?.status_message || err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});