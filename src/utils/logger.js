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
    const isProd = process.env.NODE_ENV === 'production';
    
    const transports = [];
    
    if (isProd) {
      // In production, forward logs to stdout/stderr
      transports.push(
        new winston.transports.Console({
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    } else {
      // In development, write to files
      transports.push(
        new winston.transports.File({ 
          filename: path.join(this.logsDir, 'error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(this.logsDir, 'combined.log')
        }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      );
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports
    });
  }
}

export const logger = new LoggerManager().logger;