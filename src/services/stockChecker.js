import puppeteer from 'puppeteer';
import { handleStockCheckerError } from '../utils/errorHandler.js';
import { STOCK_CHECKER_STEPS } from '../constants/stockCheckerSteps.js';

export async function checkStock(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
    try {
      await page.waitForSelector(STOCK_CHECKER_STEPS.GO_TO_CART.selector, {
        timeout: STOCK_CHECKER_STEPS.GO_TO_CART.timeout
      });
      await page.click(STOCK_CHECKER_STEPS.GO_TO_CART.selector);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      await handleStockCheckerError(
        page, 
        STOCK_CHECKER_STEPS.GO_TO_CART.id,
        error, 
        `Failed to ${STOCK_CHECKER_STEPS.GO_TO_CART.description}`
      );
    }

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
