# BaziGPT Test Scripts Cheatsheet

This document summarizes the purpose and usage of each test script in the `tests/` directory.

---

## Screenshot & Layout Tests

- **test-local-daily.js**
  - Simulates both Twitter and Telegram screenshot flows using your local API endpoints (`localhost:3000`).
  - Saves screenshots to `test-outputs/`.
  - Does NOT post to Twitter or Telegram.

- **test-modified-portrait.js**
  - Loads `portrait-layout-modified.html` from disk and takes a screenshot in portrait mode.
  - Used to preview/test local HTML layout changes.
  - Output saved to `test-outputs/`.

- **test-portrait-local.js**
  - Connects to a local dev endpoint (`localhost:3001/api/daily-share-card-portrait`).
  - Takes a portrait screenshot for Telegram-style cards.
  - Output saved to `test-outputs/`.

- **test-portrait-production.js**
  - Connects to the production endpoint for portrait share cards.
  - Takes a portrait screenshot for Telegram-style cards.
  - Output saved to `test-outputs/`.

- **test-landscape-in-portrait.js**
  - Connects to the production landscape endpoint, but renders in a portrait viewport.
  - Used to visualize how the landscape card looks in a portrait frame (for debugging layout issues).
  - Output saved to `test-outputs/`.

- **test-share-card.js**
  - Loads the production share card endpoint and takes a screenshot (landscape).
  - Also saves the HTML for inspection.
  - Output saved to `test-outputs/`.

---

## Telegram & Twitter API Tests

- **test-telegram-screenshot.js**
  - Uses the Telegram screenshot logic to generate a Telegram-optimized screenshot.
  - Saves the screenshot to `test-outputs/`.
  - Does NOT post to Telegram.

- **test-telegram.js**
  - Runs both screenshot and actual Telegram channel posting (requires valid credentials).
  - Use with caution: will post to your configured Telegram channel.

- **test-simple.js**
  - Posts a simple test tweet using the Twitter API (requires valid credentials).
  - Use with caution: will post to your Twitter account.

---

## Endpoint & Utility Tests

- **test-endpoint.js**
  - Loads the production share card endpoint and logs response status, headers, and content length.
  - For debugging endpoint accessibility and content.

- **simple-test.js**
  - Minimal Puppeteer test: launches browser, navigates to Google, logs the page title.
  - For verifying Puppeteer setup.

---

# Usage
- All scripts are run with `node <scriptname.js>` from the project root.
- Most output screenshots and HTML to the `test-outputs/` directory.
- Some scripts require your local or production API to be running.
- Some scripts will post to Twitter/Telegram if credentials are set—read descriptions above before running! 