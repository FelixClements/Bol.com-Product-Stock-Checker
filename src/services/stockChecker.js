import puppeteer from 'puppeteer';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

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
      await page.waitForSelector('#js-first-screen-accept-all-button', { visible: true });
      await page.click('#js-first-screen-accept-all-button');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.info('Cookie consent modal not found or already handled');
      throw error;
    }

    // Handle country/language modal
    try {
      await page.waitForSelector('#modalWindow > div.modal__window.js_modal_window > button', { visible: true });
      await page.locator('#modalWindow > div.modal__window.js_modal_window > button').click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.info('Country/language modal not found or already handled');
      throw error;
    }

    // add to cart
    try {
      await page.locator('xpath//html/body/div[1]/main/div/div[1]/div[2]/div[2]/section[1]/div[2]/div[1]/span/a').click();
      await new Promise(resolve => setTimeout(resolve, 1000));     
    } catch (error) {
      logger.error('Error adding product to cart:', error);
      throw error;
    }

    // button to got to cart
    try {
      await page.locator('xpath//html/body/div[3]/div[2]/div[3]/div[1]/div/div[2]/a').click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error('Error going to cart:', error);
      throw error;
    }

    // selecting the meer option
    try {
      await page.waitForSelector('xpath//html/body/div/main/wsp-basket-application/div[2]/div[1]/div/div[5]/div[1]/div/div/select');
      await page.select('select', 'Meer');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error('Error selecting the meer option:', error);
      throw error;
    }

    // change the quantity
    try {
      await page.locator('xpath//html/body/div/main/wsp-basket-application/div[2]/div[1]/div/div[5]/div[1]/div/div[1]/input').fill('500');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.keyboard.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) { 
      logger.error('Error changing the quantity:', error);
      throw error;
    }

    // get the stock value
    try {
      const product_stock = await page.waitForSelector('xpath//html/body/div/main/wsp-basket-application/div[2]/div[2]/div/div[1]/div[1]/span');
      const stock_value = await product_stock?.evaluate(el => el.getAttribute('data-amount'));
      return parseInt(stock_value, 10);
    } catch (error) {
      logger.error('Error checking stock:', error);
      throw error;
    }

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}