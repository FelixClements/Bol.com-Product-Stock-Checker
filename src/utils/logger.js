// src/utils/logger.js

import winston from 'winston';
import path from 'path';
import fs from 'fs';

class LoggerManager {
  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureDirectoryExists();
    this.initializeLogger();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  initializeLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ 
          filename: path.join(this.logsDir, 'error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(this.logsDir, 'combined.log')
        }),
      ],
    });

    // Add console logging in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }
}

export const logger = new LoggerManager().logger;