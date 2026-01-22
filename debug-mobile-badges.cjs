const puppeteer = require('puppeteer');

async function debugMobileBadges() {
  const browser = await puppeteer.launch({
    headless: false,  // Watch it run
    devtools: true,   // Open DevTools
    slowMo: 100       // Slow down to see actions
  });

  const page = await browser.newPage();

  // Set mobile viewport (375x667 - iPhone SE)
  await page.setViewport({ width: 375, height: 667 });

  // Capture console messages
  page.on('console', msg => console.log(`[BROWSER ${msg.type()}]:`, msg.text()));
  page.on('pageerror', err => console.log(`[PAGE ERROR]:`, err.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  console.log('\n=== Testing Mobile Badge Layout ===\n');

  // Wait for spells to load
  await page.waitForSelector('.spell-table tbody tr', { timeout: 10000 });

  // Get all spell rows
  const spellRows = await page.$$('.spell-table tbody tr');
  console.log(`Found ${spellRows.length} spell rows\n`);

  // Check each row for badge wrapping
  for (let i = 0; i < Math.min(10, spellRows.length); i++) {
    const rowInfo = await spellRows[i].evaluate((row, index) => {
      const spellName = row.querySelector('.spell-name-header')?.textContent || 'Unknown';
      const rowRect = row.getBoundingClientRect();

      // Get all badges
      const levelBadge = row.querySelector('.level-col');
      const schoolBadge = row.querySelector('.school-col');
      const cBadge = row.querySelector('.badge-concentration');
      const rBadge = row.querySelector('.badge-ritual');

      const badges = [];

      if (levelBadge) {
        const rect = levelBadge.getBoundingClientRect();
        badges.push({
          type: 'Level',
          text: levelBadge.textContent,
          top: rect.top - rowRect.top,
          left: rect.left - rowRect.left,
          width: rect.width,
        });
      }

      if (schoolBadge) {
        const rect = schoolBadge.getBoundingClientRect();
        badges.push({
          type: 'School',
          text: schoolBadge.textContent,
          top: rect.top - rowRect.top,
          left: rect.left - rowRect.left,
          width: rect.width,
        });
      }

      if (cBadge) {
        const rect = cBadge.getBoundingClientRect();
        badges.push({
          type: 'C',
          text: 'C',
          top: rect.top - rowRect.top,
          left: rect.left - rowRect.left,
          width: rect.width,
        });
      }

      if (rBadge) {
        const rect = rBadge.getBoundingClientRect();
        badges.push({
          type: 'R',
          text: 'R',
          top: rect.top - rowRect.top,
          left: rect.left - rowRect.left,
          width: rect.width,
        });
      }

      // Check if badges are on different lines
      const tops = badges.map(b => Math.round(b.top));
      const uniqueTops = [...new Set(tops)];
      const wrapping = uniqueTops.length > 1;

      return {
        index,
        spellName,
        rowHeight: rowRect.height,
        badges,
        wrapping,
        tops: uniqueTops,
      };
    }, i);

    console.log(`[${rowInfo.index}] ${rowInfo.spellName}`);
    console.log(`  Row height: ${rowInfo.rowHeight}px`);
    console.log(`  Badges: ${rowInfo.badges.length}`);
    rowInfo.badges.forEach(badge => {
      console.log(`    ${badge.type}: top=${badge.top.toFixed(1)}px, left=${badge.left.toFixed(1)}px, width=${badge.width.toFixed(1)}px`);
    });

    if (rowInfo.wrapping) {
      console.log(`  ⚠️  WRAPPING DETECTED! Badges on ${rowInfo.tops.length} different lines: ${rowInfo.tops.join(', ')}px`);
    } else {
      console.log(`  ✓ All badges on same line (top: ${rowInfo.tops[0]}px)`);
    }
    console.log('');
  }

  // Take a screenshot
  await page.screenshot({
    path: 'mobile-badges-debug.png',
    fullPage: true
  });
  console.log('\nScreenshot saved to mobile-badges-debug.png');

  // Keep browser open for manual inspection
  console.log('\nBrowser will stay open for 5 minutes for manual inspection...');
  console.log('Press Ctrl+C to close early.\n');

  await new Promise(resolve => setTimeout(resolve, 300000)); // 5 min

  await browser.close();
}

debugMobileBadges().catch(console.error);
