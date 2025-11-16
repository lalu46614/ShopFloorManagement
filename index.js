/**
 * Main server file for Shop Floor Management Module
 * Express server with REST API endpoints
 */

import express from 'express';
import cors from 'cors';
import config from './config.js';
import machineRoutes from './modules/shop-floor/routes.js';
import safetyRoutes from './modules/safety/routes.js';
import orderRoutes from './modules/orders/routes.js';
import whatsappRoutes from './modules/whatsapp/routes.js';
import llmRoutes from './modules/llm/routes.js';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Shop Floor Management API',
    version: '2.0.0',
    endpoints: {
      machines: '/machines',
      safety: '/safety',
      orders: '/orders',
      whatsapp: '/whatsapp/webhook',
      ai: '/ai/query',
      health: '/machines/health',
    },
  });
});

// API Routes
app.use('/machines', machineRoutes);
app.use('/safety', safetyRoutes);
app.use('/orders', orderRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/ai', llmRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log('🚀 Shop Floor Management API Server');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📊 Database: ${config.database.url}`);
  console.log('\nAvailable endpoints:');
  console.log(`  GET  http://localhost:${PORT}/machines - Get all machines`);
  console.log(`  GET  http://localhost:${PORT}/machines/:id - Get single machine`);
  console.log(`  POST http://localhost:${PORT}/machines/update - Update machine`);
  console.log(`  POST http://localhost:${PORT}/machines/batch - Batch update machines`);
  console.log(`  GET  http://localhost:${PORT}/machines/status/llm - Get LLM-formatted status`);
  console.log(`  GET  http://localhost:${PORT}/machines/health - Health check`);
  console.log('\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

