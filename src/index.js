import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { PORT, MONGO_URI } from './config/config.js';
import logger from './lib/logger.js';


import searchRoutes from "./routes/search.routes.js"
import authRoutes from './routes/auth.route.js';
import deviceRoutes from './routes/device.route.js';
import logRoutes from './routes/log.route.js';
import settingsRoutes from './routes/settings.route.js';
import errorHandler from './middleware/error.middleware.js';
import { logUserActivity } from './middleware/userActivityLog.middleware.js';
import userActivityRoutes from './routes/user-activity.route.js';
import logUseerRoutes from "./routes/user-activity.route.js"


async function start() {
  await mongoose.connect(MONGO_URI, { autoIndex: true });
  console.log(MONGO_URI)
  logger.info('Connected to MongoDB');

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: "*" }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use(rateLimit({ windowMs: 15*60*1000, max: 200 }));
  // Get the full User Report for the vallidation 
  app.use("/api/userlogs",logUseerRoutes);
  app.use("/api/findme", searchRoutes);
  app.use('/api/auth',logUserActivity, authRoutes  );
  app.use('/api/devices',logUserActivity, deviceRoutes , );
  app.use('/api/logs', logRoutes);
  app.use('/api/settings',logUserActivity, settingsRoutes);
  app.use('/api/user-activity-logs', userActivityRoutes);
  
  app.use(errorHandler);

  app.listen(PORT, () => logger.info(`Server listening on ${PORT}`));
}

start().catch(err => {
  logger.error(err);
  process.exit(1);
});
