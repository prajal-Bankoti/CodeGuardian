import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Basic API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Import and use routes
import prRoutes from './routes/prRoutes';
import bitbucketRoutes from './routes/bitbucketRoutes';

app.use('/api', prRoutes);
app.use('/api/bitbucket', bitbucketRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

export default app;
