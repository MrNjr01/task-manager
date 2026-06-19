import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { loginLimiter, apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

app.use(cors({ origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', loginLimiter);
app.use('/api', authRoutes);
app.use('/api', apiLimiter);

// Additional routes registered by respective modules
// userRoutes, projectRoutes, taskRoutes, dashboardRoutes

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
