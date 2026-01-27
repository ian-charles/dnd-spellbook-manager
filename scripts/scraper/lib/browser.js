import puppeteer from 'puppeteer';

const DDB_DOMAIN = '.dndbeyond.com';
const AUTH_TEST_URL = 'https://www.dndbeyond.com/my-account';
const LOGIN_URL_FRAGMENT = '/login';

/**
 * Launch a Puppeteer browser and configure it with auth cookies.
 * @param {import('../config.js').ScraperConfig} config
 * @returns {Promise<{ browser: import('puppeteer').Browser, page: import('puppeteer').Page }>}
 */
export async function createBrowser(config) {
  const browser = await puppeteer.launch({
    headless: config.scraping.headless,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(config.scraping.timeout);

  // Set auth cookie
  await setAuthCookie(page, config.auth.cookie);

  return { browser, page };
}

/**
 * Parse a cookie string and set it on the D&D Beyond domain.
 * Supports both "CobaltSession=VALUE" format and raw value.
 * @param {import('puppeteer').Page} page
 * @param {string} cookieString
 */
async function setAuthCookie(page, cookieString) {
  const pairs = cookieString.split(';').map(s => s.trim()).filter(Boolean);

  const cookies = pairs.map(pair => {
    const eqIdx = pair.indexOf('=');
    const name = eqIdx > -1 ? pair.slice(0, eqIdx).trim() : 'CobaltSession';
    const value = eqIdx > -1 ? pair.slice(eqIdx + 1).trim() : pair.trim();
    return {
      name,
      value,
      domain: DDB_DOMAIN,
      path: '/',
      httpOnly: true,
      secure: true,
    };
  });

  await page.setCookie(...cookies);
}

/**
 * Verify the session cookie is valid by navigating to account page.
 * Returns true if authenticated, false if redirected to login.
 * @param {import('puppeteer').Page} page
 * @returns {Promise<boolean>}
 */
export async function verifyAuth(page) {
  await page.goto(AUTH_TEST_URL, { waitUntil: 'networkidle2' });
  const url = page.url();
  return !url.includes(LOGIN_URL_FRAGMENT);
}
