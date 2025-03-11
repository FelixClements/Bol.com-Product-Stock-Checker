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
    // ... other steps
  };