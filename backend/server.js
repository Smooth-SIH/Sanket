import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { connectDB } from './src/config/db.js';
import { initRedis } from './src/config/redis.js';
import { setSocketInstance, fetchAndProcessSatelliteData } from './src/services/satelliteService.js';
import { errorHandler } from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/authRoutes.js';
import predictRoutes from './src/routes/predictRoutes.js';
import assetRoutes from './src/routes/assetRoutes.js';
import alertRoutes from './src/routes/alertRoutes.js';
import mapRoutes from './src/routes/mapRoutes.js';
import satelliteRoutes from './src/routes/satelliteRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setSocketInstance(io);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// System Status & Health Check Endpoints (Handles root and health pings)
const statusHandler = (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'SANKET Weather Warning Backend API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
};

app.get('/', statusHandler);
app.get('/health', statusHandler);
app.get('/api/health', statusHandler);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/satellite', satelliteRoutes);

// Error Handler
app.use(errorHandler);

// Socket.io Connection
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.emit('connected', { message: 'Connected to SANKET Telemetry Stream' });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Initialize Datastores & Ingest Satellite
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(`  SANKET Express Backend Running on Port ${PORT}`);
  console.log(`==================================================`);

  await connectDB();
  await initRedis();

  // Initial Satellite data fetch
  await fetchAndProcessSatelliteData();

  // Schedule 5-Minute MOSDAC INSAT-3D Telemetry Ingestion & Keep-Alive Ping (300,000 ms)
  setInterval(async () => {
    console.log('[Scheduler] Triggering 5-minute INSAT-3D scan cycle & keep-alive ping...');
    await fetchAndProcessSatelliteData();

    // Render Keep-Alive Auto-Ping (prevents 15-minute free tier sleep)
    const backendUrl = process.env.RENDER_BACKEND_URL || 'https://sanket-backend-epo6.onrender.com';
    const mlUrl = process.env.RENDER_ML_SERVICE_URL || 'https://sanket-ml-service.onrender.com';
    
    try {
      if (typeof fetch !== 'undefined') {
        fetch(backendUrl).catch(e => console.warn('[KeepAlive] Backend self-ping warning:', e.message));
        fetch(mlUrl).catch(e => console.warn('[KeepAlive] ML Service self-ping warning:', e.message));
      }
    } catch (err) {
      console.warn('[KeepAlive] Self-ping timer error:', err.message);
    }
  }, 300000);
});

