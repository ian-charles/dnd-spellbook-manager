# D&D Beyond Spell Scraper

Personal-use tool for scraping spell data from D&D Beyond source books. Not part of the deployed app.

## Prerequisites

- Node.js 18+
- A D&D Beyond account with purchased source books
- A valid session cookie from D&D Beyond

## Setup

1. Copy the example config:
   ```bash
   cp scripts/scraper.config.example.json scripts/scraper.config.json
   ```

2. Get your D&D Beyond session cookie:
   - Log into D&D Beyond in your browser
   - Open DevTools (F12) > Application > Cookies > `www.dndbeyond.com`
   - Copy the `CobaltSession` cookie value

3. Edit `scripts/scraper.config.json`:
   ```json
   {
     "auth": {
       "cookie": "CobaltSession=YOUR_COOKIE_VALUE"
     },
     "sources": [
       {
         "filterId": 27,
         "canonical": "Xanathar's Guide to Everything",
         "slug": "xanathars"
       }
     ]
   }
   ```

## Finding Source Filter IDs

1. Go to https://www.dndbeyond.com/spells
2. Use the "Source" filter dropdown to select a book
3. The URL will update to include `filter-source=N` — that number is the `filterId`

## Usage

### Scrape spells from configured sources
```bash
npm run scrape:spells
```

This will:
- Launch a headless browser with your session cookie
- Collect spell URLs from each source's listing pages
- Scrape individual spell detail pages
- Save output to `data/scraped/spells-{slug}.json`
- Save checkpoints for resume on interruption

### Merge scraped data into the main spell database
```bash
npm run merge:spells
```

This combines `public/data/spells.json` (Open5e) with all `data/scraped/spells-*.json` files. Base spells take priority on ID collision.

## Resuming Interrupted Scrapes

If the scraper is interrupted (network error, rate limit, manual stop), just run it again. Checkpoint files in `data/scraped/.checkpoint-{slug}.json` track progress per-source and the scraper resumes from where it left off.

## Configuration Reference

| Field | Default | Description |
|-------|---------|-------------|
| `auth.cookie` | (required) | D&D Beyond session cookie |
| `sources[].filterId` | (required) | D&D Beyond source filter ID |
| `sources[].canonical` | (required) | Source name used in spell data |
| `sources[].slug` | (required) | Short name for output file |
| `scraping.delayBetweenRequests` | `2000` | Milliseconds between requests |
| `scraping.maxRetries` | `3` | Retry attempts per spell page |
| `scraping.timeout` | `30000` | Page load timeout (ms) |
| `scraping.headless` | `true` | Run browser without UI |
| `output.directory` | `data/scraped` | Output directory |

## Troubleshooting

**"Authentication failed"**: Your session cookie has expired. Get a fresh one from D&D Beyond.

**"Could not find spell name"**: D&D Beyond changed their page structure. Update the selectors in `lib/parser.js`.

**Rate limiting / 403 errors**: Increase `delayBetweenRequests` in config. The scraper adds random jitter automatically.

**Resuming after parser fix**: Delete the checkpoint file for that source (`data/scraped/.checkpoint-{slug}.json`) to re-scrape from scratch.

## Architecture

```
scrape-spells.js          Entry point — orchestrates the full pipeline
merge-spells.js           Merges scraped data with Open5e base
config.js                 Config loader with validation and defaults
lib/
  browser.js              Puppeteer browser lifecycle + cookie auth
  listing-scraper.js      Phase 1: paginated spell URL collection
  detail-scraper.js       Phase 2: individual spell page scraping
  parser.js               DOM extraction with fallback selectors
  spell-transformer.js    Raw data → Spell schema mapping
  validator.js            Schema validation
  checkpoint.js           Progress persistence for resume
  rate-limiter.js         Request throttling with jitter
  logger.js               Structured logging
```
