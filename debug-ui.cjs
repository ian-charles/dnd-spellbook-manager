#!/usr/bin/env node

/**
 * General-purpose Puppeteer debugging tool for the D&D Spellbook Manager
 *
 * Usage:
 *   node debug-ui.js                          # Interactive mode
 *   node debug-ui.js --check <selector>       # Check if element exists
 *   node debug-ui.js --click <selector>       # Click an element
 *   node debug-ui.js --text <selector>        # Get element text
 *   node debug-ui.js --screenshot <path>      # Take a screenshot
 *   node debug-ui.js --eval <js-code>         # Evaluate JavaScript
 *
 * Examples:
 *   node debug-ui.js --check ".spell-row"
 *   node debug-ui.js --click "button[data-testid='btn-add-spell']"
 *   node debug-ui.js --text ".spell-name"
 *   node debug-ui.js --screenshot debug.png
 *   node debug-ui.js --eval "document.querySelectorAll('.spell-row').length"
 */

const puppeteer = require('puppeteer');

const TEST_URL = 'http://localhost:5173';
const DEFAULT_TIMEOUT = 30000;

async function setupBrowser() {
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Enable console logging from the page
  page.on('console', (msg) => {
    const type = msg.type();
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '📝';
    console.log(`${prefix} [Browser Console ${type}]:`, msg.text());
  });

  // Enable error logging
  page.on('pageerror', (error) => {
    console.error('❌ [Page Error]:', error.message);
  });

  return { browser, page };
}

async function waitForSpellsToLoad(page) {
  console.log('⏳ Waiting for spells to load...');
  await page.waitForSelector('.spell-row', { timeout: DEFAULT_TIMEOUT });
  await page.waitForFunction(
    () => {
      const rows = document.querySelectorAll('.spell-row');
      return rows.length > 0;
    },
    { timeout: DEFAULT_TIMEOUT }
  );
  console.log('✅ Spells loaded');
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Command handlers
const commands = {
  async check(page, selector) {
    console.log(`🔍 Checking for element: ${selector}`);
    const element = await page.$(selector);
    if (element) {
      console.log('✅ Element found');
      const count = await page.$$eval(selector, els => els.length);
      console.log(`   Found ${count} matching element(s)`);
      return true;
    } else {
      console.log('❌ Element not found');
      return false;
    }
  },

  async click(page, selector) {
    console.log(`👆 Clicking element: ${selector}`);
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector);
      await wait(300); // Wait for UI to update
      console.log('✅ Clicked successfully');
      return true;
    } catch (error) {
      console.error('❌ Click failed:', error.message);
      return false;
    }
  },

  async text(page, selector) {
    console.log(`📄 Getting text from: ${selector}`);
    try {
      const text = await page.$eval(selector, el => el.textContent);
      console.log('✅ Text content:', text);
      return text;
    } catch (error) {
      console.error('❌ Failed to get text:', error.message);
      return null;
    }
  },

  async screenshot(page, filepath = 'debug-screenshot.png') {
    console.log(`📸 Taking screenshot: ${filepath}`);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log('✅ Screenshot saved');
    return filepath;
  },

  async eval(page, code) {
    console.log(`⚙️  Evaluating: ${code}`);
    try {
      const result = await page.evaluate((code) => {
        return eval(code);
      }, code);
      console.log('✅ Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Evaluation failed:', error.message);
      return null;
    }
  },

  async html(page, selector) {
    console.log(`📋 Getting HTML from: ${selector}`);
    try {
      const html = await page.$eval(selector, el => el.outerHTML);
      console.log('✅ HTML:', html.substring(0, 200) + (html.length > 200 ? '...' : ''));
      return html;
    } catch (error) {
      console.error('❌ Failed to get HTML:', error.message);
      return null;
    }
  },

  async count(page, selector) {
    console.log(`🔢 Counting elements: ${selector}`);
    const count = await page.$$eval(selector, els => els.length);
    console.log(`✅ Found ${count} element(s)`);
    return count;
  },

  async wait(page, ms) {
    console.log(`⏳ Waiting ${ms}ms...`);
    await wait(ms);
    console.log('✅ Done waiting');
    return true;
  },

  async goto(page, url = TEST_URL) {
    console.log(`🌐 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('✅ Navigation complete');
    return true;
  },

  async type(page, selector, text) {
    console.log(`⌨️  Typing into ${selector}: "${text}"`);
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.type(selector, text);
      await wait(300);
      console.log('✅ Typed successfully');
      return true;
    } catch (error) {
      console.error('❌ Type failed:', error.message);
      return false;
    }
  },

  async clear(page, selector) {
    console.log(`🧹 Clearing input: ${selector}`);
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.$eval(selector, el => el.value = '');
      console.log('✅ Cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Clear failed:', error.message);
      return false;
    }
  },
};

// Interactive REPL mode
async function interactiveMode(page) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'debug> '
  });

  console.log('\n🎮 Interactive Debug Mode');
  console.log('Commands: check, click, text, screenshot, eval, html, count, wait, goto, type, clear, help, exit');
  console.log('Example: check .spell-row\n');

  rl.prompt();

  rl.on('line', async (line) => {
    const [cmd, ...args] = line.trim().split(' ');

    if (cmd === 'exit' || cmd === 'quit') {
      console.log('👋 Exiting...');
      rl.close();
      return;
    }

    if (cmd === 'help') {
      console.log('\nAvailable commands:');
      Object.keys(commands).forEach(c => console.log(`  - ${c}`));
      console.log('  - help');
      console.log('  - exit\n');
      rl.prompt();
      return;
    }

    if (commands[cmd]) {
      try {
        await commands[cmd](page, ...args);
      } catch (error) {
        console.error('❌ Command error:', error.message);
      }
    } else if (cmd) {
      console.log(`❓ Unknown command: ${cmd}. Type 'help' for available commands.`);
    }

    rl.prompt();
  });

  return new Promise((resolve) => {
    rl.on('close', resolve);
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const { browser, page } = await setupBrowser();

  try {
    // Navigate to the app
    console.log(`🌐 Opening ${TEST_URL}...`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);

    // Parse command-line arguments
    if (args.length === 0) {
      // Interactive mode
      await interactiveMode(page);
    } else {
      // Command mode
      const command = args[0].replace('--', '');
      const commandArgs = args.slice(1);

      if (commands[command]) {
        const result = await commands[command](page, ...commandArgs);
        if (result !== undefined && result !== null) {
          console.log('\n📤 Return value:', result);
        }
      } else {
        console.error(`❌ Unknown command: ${command}`);
        console.log('\nAvailable commands:');
        Object.keys(commands).forEach(c => console.log(`  --${c}`));
        process.exit(1);
      }
    }

    // Keep browser open in interactive mode, close in command mode
    if (args.length > 0) {
      await browser.close();
    } else {
      console.log('\n💡 Browser will stay open. Close it manually when done.');
      // Wait indefinitely
      await new Promise(() => { });
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await browser.close();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Interrupted. Exiting...');
  process.exit(0);
});

main();
