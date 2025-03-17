// src/constants/stockCheckerSteps.js

export const STOCK_CHECKER_STEPS = {
    COOKIE_CONSENT: {
      id: 'cookie_consent',
      selector: '#js-first-screen-accept-all-button',
      description: 'Handle cookie consent modal',
      timeout: 5000
    },
    COUNTRY_MODAL: {
      id: 'country_modal',
      selector: '#modalWindow > div.modal__window.js_modal_window > button',
      description: 'Handle country/language modal',
      timeout: 5000
    },
    PRODUCT_AVAILABLE: {
      id: 'product_available',
      selector: 'xpath//html/body/div/main/div/div[1]/div[2]/div[2]/section[1]/div[2]/div[2]/div[2]/div/text()',
      description: 'Is the product available?',
      timeout: 5000
    },
    ADD_TO_CART: {
      id: 'add_to_cart',
      selector: 'xpath//html/body/div[1]/main/div/div[1]/div[2]/div[2]/section[1]/div[2]/div[1]/span/a',
      selector2: 'xpath//html/body/div[1]/main/div/div[1]/div[2]/div[2]/section[1]/div[2]/div[2]/span/a',
      description: 'add to product to cart',
      timeout: 5000
    },
    GO_TO_CART: {
      id: 'go_to_cart',
      selector: 'xpath//html/body/div[3]/div[2]/div[3]/div[1]/div/div[2]/a',
      description: 'go to cart page',
      timeout: 5000
    },
    SELECT_MEER_OPTION: {
      id: 'select_meer_option',
      selector: 'xpath//html/body/div/main/wsp-basket-application/div[2]/div[1]/div/div[5]/div[1]/div/div/select',
      description: 'Select the "Meer" option from the dropdown',
      timeout: 5000
    },
    CHANGE_QUANTITY: {
      id: 'change_quantity',
      selector: 'xpath//html/body/div/main/wsp-basket-application/div[2]/div[1]/div/div[5]/div[1]/div/div[1]/input',
      quantity: '500',
      description: 'Change the quantity to 500',
      timeout: 5000
    },
    GET_STOCK_VALUE: {
      id: 'get_stock_value',
      selector: 'xpath//html/body/div/main/wsp-basket-application/div[2]/div[2]/div/div[1]/div[1]/span',
      description: 'Get the stock value from the product page',
      timeout: 5000
    }
};