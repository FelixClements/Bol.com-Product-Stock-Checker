// src/services/stockChecker.js
import puppeteer from 'puppeteer';
import { handleStockCheckerError } from '../utils/errorHandler.js';
import { STOCK_CHECKER_STEPS } from '../constants/stockCheckerSteps.js';
import { logger } from '../utils/logger.js';

export async function checkStock(url, productId = null) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/usr/bin/chromium'
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    page.setDefaultTimeout(5000);

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Handle cookie consent
    try {
      await page.waitForSelector(STOCK_CHECKER_STEPS.COOKIE_CONSENT.selector, { 
        visible: true,
        timeout: STOCK_CHECKER_STEPS.COOKIE_CONSENT.timeout 
      });
      await page.click(STOCK_CHECKER_STEPS.COOKIE_CONSENT.selector);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      await handleStockCheckerError(
        page, 
        STOCK_CHECKER_STEPS.COOKIE_CONSENT.id,
        error, 
        `Failed to ${STOCK_CHECKER_STEPS.COOKIE_CONSENT.description}`
      );
    }

    // Handle country/language modal
    try {
      await page.waitForSelector(STOCK_CHECKER_STEPS.COUNTRY_MODAL.selector, { 
        visible: true,
        timeout: STOCK_CHECKER_STEPS.COUNTRY_MODAL.timeout 
      });
      await page.click(STOCK_CHECKER_STEPS.COUNTRY_MODAL.selector);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      await handleStockCheckerError(
        page, 
        STOCK_CHECKER_STEPS.COUNTRY_MODAL.id,
        error, 
        `Failed to ${STOCK_CHECKER_STEPS.COUNTRY_MODAL.description}`
      );
    }

    // Check if the product is available
    try {
      // Try the first selector - this would indicate the product is NOT available
      try {
        const productNotAvailable = await page.waitForSelector(STOCK_CHECKER_STEPS.PRODUCT_AVAILABLE.selector, { 
          timeout: STOCK_CHECKER_STEPS.PRODUCT_AVAILABLE.timeout 
        });
        const productAvailableText = await productNotAvailable.evaluate(el => el.textContent);
        if (productAvailableText.trim() == 'Ontvang eenmalig een mail of notificatie via de bol app zodra dit artikel weer leverbaar is.') {
          logger.info('Product is not available');
          return 0;
        }
      } catch (firstSelectorError) {
        // First selector not found - this is expected when product IS available
        // Try the second selector which should be present for available products
        try {
          await page.waitForSelector(STOCK_CHECKER_STEPS.PRODUCT_AVAILABLE.selector2, { 
            timeout: STOCK_CHECKER_STEPS.PRODUCT_AVAILABLE.timeout 
          });
          // If we made it here, the second selector exists, which means the product is available
          logger.info('Product is available (confirmed via selector2)');
        } catch (secondSelectorError) {
          // Both selectors failed - log and continue to see if we can proceed anyway
          logger.warn('Both availability selectors failed, attempting to continue the process');
        }
      }
    } catch (error) {
      // This catches any other errors in the overall availability check
      await handleStockCheckerError(
        page, 
        STOCK_CHECKER_STEPS.PRODUCT_AVAILABLE.id,
        error, 
        `Failed to ${STOCK_CHECKER_STEPS.PRODUCT_AVAILABLE.description}`
      );
    }

    // Add to cart
    try {
      // Try the first selector
      const firstSelector = STOCK_CHECKER_STEPS.ADD_TO_CART.selector;
      await page.waitForSelector(firstSelector, { timeout: STOCK_CHECKER_STEPS.ADD_TO_CART.timeout });
      await page.click(firstSelector);
    } catch (firstSelectorError) {
      console.warn("First selector failed, trying fallback...", firstSelectorError.message);
      try {
        // Try the fallback selector
        const fallbackSelector = STOCK_CHECKER_STEPS.ADD_TO_CART.selector2;
        await page.waitForSelector(fallbackSelector, { timeout: STOCK_CHECKER_STEPS.ADD_TO_CART.timeout });
        await page.click(fallbackSelector);
      } catch (fallbackSelectorError) {
        // Both failed, handle final failure here
        await handleStockCheckerError(
          page, 
          STOCK_CHECKER_STEPS.ADD_TO_CART.id,
          fallbackSelectorError, 
          `Failed to ${STOCK_CHECKER_STEPS.ADD_TO_CART.description} with both selectors`
        );
      }
    }

    // Wait after clicking
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Go to cart
    await page.goto(STOCK_CHECKER_STEPS.BASKET_URL.url, { waitUntil: 'networkidle2' });

    // Select meer option
    try {
      await page.waitForSelector(STOCK_CHECKER_STEPS.SELECT_MEER_OPTION.selector, {
        timeout: STOCK_CHECKER_STEPS.SELECT_MEER_OPTION.timeout
      });
      await page.select(STOCK_CHECKER_STEPS.SELECT_MEER_OPTION.selector, 'Meer');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      await handleStockCheckerError(
        page, 
        STOCK_CHECKER_STEPS.SELECT_MEER_OPTION.id,
        error, 
        `Failed to ${STOCK_CHECKER_STEPS.SELECT_MEER_OPTION.description}`
      );
    }

    // Change quantity
    try {
      await page.waitForSelector(STOCK_CHECKER_STEPS.CHANGE_QUANTITY.selector, {
        timeout: STOCK_CHECKER_STEPS.CHANGE_QUANTITY.timeout
      });
      await page.locator(STOCK_CHECKER_STEPS.CHANGE_QUANTITY.selector).fill(STOCK_CHECKER_STEPS.CHANGE_QUANTITY.quantity);
      await page.keyboard.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      await handleStockCheckerError(
        page, 
        STOCK_CHECKER_STEPS.CHANGE_QUANTITY.id,
        error, 
        `Failed to ${STOCK_CHECKER_STEPS.CHANGE_QUANTITY.description}`
      );
    }

    // Get stock value
    try {
      const productStock = await page.waitForSelector(STOCK_CHECKER_STEPS.GET_STOCK_VALUE.selector, {
        timeout: STOCK_CHECKER_STEPS.GET_STOCK_VALUE.timeout
      });
      const stockValue = await productStock?.evaluate(el => el.getAttribute('data-amount'));
      return parseInt(stockValue, 10);
    } catch (error) {
      await handleStockCheckerError(
        page, 
        STOCK_CHECKER_STEPS.GET_STOCK_VALUE.id,
        error, 
        `Failed to ${STOCK_CHECKER_STEPS.GET_STOCK_VALUE.description}`
      );
    }

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
