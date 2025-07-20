# BaziGPT Tweetbot - Changelog

## 📋 Current Setup (Latest)

### 🎯 **Active Production Files**

#### **Core Bot Scripts:**
- **`tweet.js`** - Twitter bot (landscape layout, 1200x630)
- **`telegram-alt.js`** - Telegram bot (landscape layout, 1200x630) - **CURRENTLY ACTIVE**
- **`telegram-portrait.js`** - Telegram bot (portrait layout, 800x1200) - **NEW PORTRAIT VERSION**

#### **Unified Runner:**
- **`run-all.js`** - Runs both Twitter and Telegram bots conditionally

#### **Test Scripts:**
- **`test-share-card.js`** - Test landscape share card
- **`test-telegram.js`** - Test Telegram bot functionality
- **`test-telegram-screenshot.js`** - Test Telegram screenshot dimensions
- **`test-portrait-production.js`** - Test portrait layout with production endpoint
- **`test-portrait-local.js`** - Test portrait layout with local endpoint
- **`test-landscape-in-portrait.js`** - Test landscape layout in portrait viewport

### 🚀 **GitHub Actions Workflows**

#### **Scheduled Workflows:**
- **`.github/workflows/tweet-daily.yml`** - Daily Twitter posts at midnight UTC
- **`.github/workflows/telegram-daily.yml`** - Daily Telegram posts at midnight UTC (uses `telegram-portrait.js`)

#### **Manual Workflows:**
- **`.github/workflows/daily-post.yml`** - Manual trigger to run both Twitter and Telegram

### 📦 **NPM Scripts**

#### **Production Scripts:**
```bash
npm start              # Run both Twitter and Telegram
npm run tweet          # Run Twitter bot only
npm run telegram       # Run original Telegram bot (landscape)
npm run telegram-alt   # Run alternative Telegram bot (landscape)
npm run telegram-portrait # Run portrait Telegram bot (NEW)
```

#### **Test Scripts:**
```bash
npm run test-card              # Test landscape share card
npm run test-telegram          # Test Telegram functionality
npm run test-telegram-screenshot # Test Telegram screenshot
npm run test-portrait-production # Test portrait with production
npm run test-portrait-local    # Test portrait with local endpoint
npm run test-landscape-in-portrait # Test landscape in portrait viewport
npm run verify                 # Verify environment setup
```

### 🔧 **Environment Variables**

#### **Required:**
```bash
# Twitter API v2
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=@your_channel_username
```

### 🌐 **Endpoints**

#### **Production:**
- **Landscape:** `https://bazigpt.xyz/api/daily-share-card`
- **PNG:** `https://bazigpt.xyz/api/daily-share-card-png`

#### **Local Development:**
- **Portrait:** `http://localhost:3001/api/daily-share-card-portrait`

## 📝 **Recent Changes**

### **Latest Updates:**
- ✅ **Updated all Puppeteer scripts** to use `headless: "new"` (eliminates deprecation warnings)
- ✅ **Created portrait Telegram bot** (`telegram-portrait.js`) for mobile-optimized posts
- ✅ **Updated GitHub Actions workflow** to use portrait layout for Telegram
- ✅ **Added comprehensive test scripts** for portrait layout testing
- ✅ **Fixed domain references** from `bazigpt.com` to `bazigpt.xyz`
- ✅ **Improved error handling** in test scripts with proper browser cleanup

### **Portrait Layout Features:**
- **Viewport:** 800x1200 (portrait orientation)
- **Optimized for mobile** Telegram users
- **Dynamic height calculation** to fit content properly
- **Enhanced Chinese font loading** for proper character rendering

### **Test Script Purposes:**

#### **Production Testing:**
- **`test-portrait-production.js`** - Tests portrait layout with production endpoint
- **`test-landscape-in-portrait.js`** - Shows what landscape layout looks like in portrait viewport

#### **Local Development:**
- **`test-portrait-local.js`** - Tests portrait layout with local development endpoint

#### **Functionality Testing:**
- **`test-telegram.js`** - Tests full Telegram bot functionality
- **`test-telegram-screenshot.js`** - Tests screenshot capture and dimensions

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **Chinese Characters Not Rendering:**
- ✅ **Fixed:** All scripts now include enhanced font loading
- ✅ **Fixed:** GitHub Actions installs Noto CJK fonts

#### **Image Cutoff Issues:**
- ✅ **Fixed:** Dynamic height calculation in portrait scripts
- ✅ **Fixed:** Proper viewport sizing for different orientations

#### **Puppeteer Deprecation Warnings:**
- ✅ **Fixed:** All scripts use `headless: "new"`

#### **Test Scripts Not Exiting:**
- ✅ **Fixed:** Added proper `browser.close()` in finally blocks

### **Debugging Commands:**
```bash
# Test current production portrait layout
npm run test-portrait-production

# Test landscape layout in portrait viewport
npm run test-landscape-in-portrait

# Verify environment setup
npm run verify
```

## 🎯 **Current Status**

### **Active Workflows:**
- ✅ **Twitter:** Daily posts using landscape layout
- ✅ **Telegram:** Daily posts using portrait layout (mobile-optimized)

### **Test Coverage:**
- ✅ **Landscape testing** - `test-share-card.js`
- ✅ **Portrait testing** - `test-portrait-production.js`
- ✅ **Telegram functionality** - `test-telegram.js`
- ✅ **Screenshot validation** - `test-telegram-screenshot.js`

### **Next Steps:**
- 🎯 **Deploy portrait endpoint** to production
- 🎯 **Test portrait layout** with real Telegram posts
- 🎯 **Monitor performance** and user feedback

---

*Last updated: December 2024* 