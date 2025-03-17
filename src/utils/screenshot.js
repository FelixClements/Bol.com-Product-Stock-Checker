// src/utils/screenshot.js

import path from 'path';
import fs from 'fs';
import { logger } from './logger.js'; // Import logger

class ScreenshotManager {
  constructor() {
    this.screenshotsDir = path.join(process.cwd(), 'logs', 'screenshots');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  async takeErrorScreenshot(page, step) {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(
      this.screenshotsDir, 
      `error_${date}_step_${step}.png`
    );
    
    try {
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      return screenshotPath;
    } catch (error) {
      logger.error(`Failed to take screenshot for step ${step}:`, error);
      return null;
    }
  }
}

export const screenshotManager = new ScreenshotManager();