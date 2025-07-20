require('dotenv').config();
const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');

// Configuration
const SHARE_CARD_URL = 'https://bazigpt.xyz/api/daily-share-card-png';
const BAZI_SITE_URL = 'bazigpt.xyz';

// Validate environment variables
function validateEnv() {
    const required = [
        'TELEGRAM_BOT_TOKEN',
        'TELEGRAM_CHANNEL_ID'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

// Get today's date in a readable format
function getTodayDate() {
    const today = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return today.toLocaleDateString('en-US', options);
}

// Capture screenshot using Puppeteer
async function captureScreenshot() {
    console.log('🚀 Launching Puppeteer...');

    const browser = await puppeteer.launch({
        headless: true, // Use old headless mode for better compatibility
        executablePath: process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-extensions'
        ]
    });

    try {
        console.log(`📄 Navigating to ${SHARE_CARD_URL}...`);
        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport for consistent rendering
        await page.setViewport({
            width: 1200,
            height: 630,
            deviceScaleFactor: 2 // Higher resolution
        });

        // Enhanced Chinese font loading
        await page.evaluateOnNewDocument(() => {
            // Force font loading for Chinese characters
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap';
            document.head.appendChild(link);

            // Set comprehensive fallback fonts for Chinese characters
            document.body.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
        });

        // Wait for fonts to load
        await page.waitForTimeout(2000);

        // Force font loading by rendering Chinese characters
        await page.evaluate(() => {
            // Create a hidden element with Chinese text to force font loading
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.left = '-9999px';
            testElement.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
            testElement.textContent = '天地玄黄宇宙洪荒日月盈昃辰宿列张';
            document.body.appendChild(testElement);

            // Force a repaint
            testElement.offsetHeight;
        });

        // Navigate with simpler settings
        await page.goto(SHARE_CARD_URL, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for fonts to fully load and render
        await page.waitForTimeout(5000);

        console.log('📸 Taking screenshot...');
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false,
            omitBackground: false
        });

        console.log('✅ Screenshot captured successfully');
        return screenshot;

    } finally {
        await browser.close();
        console.log('🔒 Browser closed');
    }
}

// Initialize Telegram Bot
function createTelegramBot() {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    return bot;
}

// Send message to Telegram channel
async function sendToTelegram(screenshot) {
    console.log('📱 Initializing Telegram bot...');
    const bot = createTelegramBot();

    try {
        console.log('📤 Sending message to Telegram channel...');

        const todayDate = getTodayDate();
        const messageText = `🗓️ Daily Bazi Forecast – ${todayDate}\n\nCheck your chart → ${BAZI_SITE_URL}\n\n#Bazi #ChineseAstrology #BaziGPT`;

        // Send photo with caption
        const result = await bot.sendPhoto(process.env.TELEGRAM_CHANNEL_ID, screenshot, {
            caption: messageText,
            parse_mode: 'HTML'
        });

        console.log('✅ Message sent to Telegram successfully!');
        console.log(`📱 Message ID: ${result.message_id}`);

        return result;

    } catch (error) {
        console.error('❌ Error sending to Telegram:', error.message);
        throw error;
    }
}

// Main function
async function main() {
    try {
        console.log('🎯 Starting BaziGPT Telegram Bot...');

        // Validate environment variables
        validateEnv();
        console.log('✅ Environment variables validated');

        // Capture screenshot
        const screenshot = await captureScreenshot();

        // Send to Telegram
        await sendToTelegram(screenshot);

        console.log('🎉 Daily Bazi forecast sent to Telegram successfully!');

    } catch (error) {
        console.error('💥 Error in main process:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, captureScreenshot, sendToTelegram }; 