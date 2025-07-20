# BaziGPT Bot - Change Log

## 🎯 Current Active Files

### **Core Scripts (In Use)**
- **`tweet.js`** - Twitter bot (scheduled daily)
- **`telegram-alt.js`** - Telegram bot (scheduled daily) - *working version*
- **`run-all.js`** - Unified runner for both platforms (manual trigger)

### **Workflows (In Use)**
- **`.github/workflows/tweet-daily.yml`** - Twitter scheduled workflow
- **`.github/workflows/telegram-daily.yml`** - Telegram scheduled workflow (calls `telegram-alt.js`)
- **`.github/workflows/daily-post.yml`** - Manual unified workflow (no schedule)

## 🔧 Commands

### **Production Commands**
```bash
npm start          # Runs both Twitter + Telegram
npm run tweet      # Twitter only
npm run telegram   # Telegram only (calls telegram-alt.js)
```

### **Testing Commands**
```bash
npm run test-telegram           # Test Telegram functionality
npm run test-telegram-screenshot # Test screenshot dimensions
npm run test-card               # Test screenshot capture
npm run verify                  # Verify environment setup
```

## 📁 File Status

### ✅ **Active Files**
- `tweet.js` - Twitter bot (working)
- `telegram-alt.js` - Telegram bot (working, used by workflow)
- `run-all.js` - Unified runner (working)
- `package.json` - Dependencies and scripts
- `.github/workflows/tweet-daily.yml` - Twitter workflow
- `.github/workflows/telegram-daily.yml` - Telegram workflow
- `.github/workflows/daily-post.yml` - Manual unified workflow

### 📚 **Reference Files**
- `telegram.js` - Original Telegram script (not used, kept for reference)
- `telegram-optimized.js` - 16:9 aspect ratio version (not used)
- `test-telegram-screenshot.js` - Screenshot testing utility

### 🗑️ **Legacy Files**
- `tweet-fallback.js` - Old fallback script
- `simple-test.js` - Old test script
- `test-endpoint.js` - Old endpoint test
- `test-simple.js` - Old simple test

## 🔑 Environment Variables

### **Required**
```bash
# Twitter
TWITTER_API_KEY
TWITTER_API_SECRET  
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_SECRET

# Telegram
TELEGRAM_BOT_TOKEN
TELEGRAM_CHANNEL_ID
```

### **Optional**
```bash
ENABLE_TWITTER=true    # Default: true
ENABLE_TELEGRAM=true   # Default: true
```

## 🚀 Workflow Schedule

- **Twitter**: Daily at midnight UTC (automatic)
- **Telegram**: Daily at midnight UTC (automatic)  
- **Unified**: Manual trigger only (no schedule)

## 📐 Image Dimensions

- **Twitter**: `1200x630` (standard)
- **Telegram**: Dynamic height based on content, capped at 630px (from `telegram-alt.js`)

## ✨ Key Features

✅ **Chinese character rendering** - Fixed with font installation  
✅ **Multi-platform support** - Twitter + Telegram  
✅ **Independent workflows** - No duplicate posts  
✅ **Error handling** - Each service runs independently  
✅ **Manual override** - Can run both together when needed  
✅ **Font optimization** - Noto CJK fonts installed in GitHub Actions  

## 📝 Important Notes

- **`telegram-alt.js`** is the working version because it uses dynamic height calculation
- **`telegram.js`** was kept for reference but has fixed dimensions that caused cutoff
- **Font installation** in GitHub Actions fixed Chinese character rendering
- **Separate workflows** prevent duplicate posts while allowing independent operation

## 🔄 Recent Changes

### **Latest Updates**
- ✅ Fixed Chinese character rendering with font installation
- ✅ Added Telegram integration with dynamic height calculation
- ✅ Created unified runner for multi-platform posting
- ✅ Separated workflows to prevent duplicate posts
- ✅ Added comprehensive testing scripts

### **Known Issues**
- None currently - all features working as expected

## 🛠️ Troubleshooting

### **If Telegram images are cut off:**
- Use `telegram-alt.js` (already configured)
- Check font installation in GitHub Actions
- Verify channel permissions

### **If Chinese characters don't render:**
- Ensure Noto CJK fonts are installed
- Check font loading in Puppeteer
- Verify webapp font configuration

### **If workflows fail:**
- Check environment variables
- Verify API credentials
- Check GitHub Actions logs for specific errors 