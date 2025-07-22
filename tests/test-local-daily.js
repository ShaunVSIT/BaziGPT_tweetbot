const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Local endpoints
const LOCAL_TWITTER_URL = 'http://localhost:3000/api/daily-share-card-png';
const LOCAL_TELEGRAM_URL = 'http://localhost:3000/api/daily-share-card-portrait';
const OUTPUT_DIR = path.join(__dirname, 'test-outputs');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// Helper: get today's date string for filenames
function getTodayDateStr() {
    const today = new Date();
    return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Screenshot for Twitter (landscape)
async function captureTwitterScreenshot() {
    console.log('🚀 [Twitter] Launching Puppeteer...');
    const browser = await puppeteer.launch({
        headless: "new",
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
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
        await page.evaluateOnNewDocument(() => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap';
            document.head.appendChild(link);
            document.body.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
        });
        await page.waitForTimeout(2000);
        await page.evaluate(() => {
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.left = '-9999px';
            testElement.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
            testElement.textContent = '天地玄黄宇宙洪荒日月盈昃辰宿列张';
            document.body.appendChild(testElement);
            testElement.offsetHeight;
        });
        await page.goto(LOCAL_TWITTER_URL, { waitUntil: 'networkidle0', timeout: 30000 });
        await page.waitForTimeout(5000);
        const screenshot = await page.screenshot({ type: 'png', fullPage: false, omitBackground: false });
        return screenshot;
    } finally {
        await browser.close();
    }
}

// Screenshot for Telegram (portrait)
async function captureTelegramPortraitScreenshot() {
    console.log('🚀 [Telegram Portrait] Launching Puppeteer...');
    const browser = await puppeteer.launch({
        headless: "new",
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
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 2 });
        await page.evaluateOnNewDocument(() => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap';
            document.head.appendChild(link);
            document.body.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
        });
        await page.waitForTimeout(2000);
        await page.evaluate(() => {
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.left = '-9999px';
            testElement.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
            testElement.textContent = '天地玄黄宇宙洪荒日月盈昃辰宿列张';
            document.body.appendChild(testElement);
            testElement.offsetHeight;
        });
        await page.goto(LOCAL_TELEGRAM_URL, { waitUntil: 'networkidle0', timeout: 30000 });
        await page.waitForTimeout(5000);
        // Get content height (as in telegram-portrait.js)
        const contentHeight = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            if (!body || !html) return 1200;
            const height = Math.max(
                body.scrollHeight || 0,
                body.offsetHeight || 0,
                html.clientHeight || 0,
                html.scrollHeight || 0,
                html.offsetHeight || 0
            );
            return height || 1200;
        });
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false,
            omitBackground: false,
            clip: {
                x: 0,
                y: 0,
                width: 800,
                height: Math.min(contentHeight, 1200)
            }
        });
        return screenshot;
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        // Twitter (landscape)
        const twitterScreenshot = await captureTwitterScreenshot();
        const twitterPath = path.join(OUTPUT_DIR, `twitter-local-screenshot-${getTodayDateStr()}.png`);
        fs.writeFileSync(twitterPath, twitterScreenshot);
        console.log(`✅ [Twitter] Screenshot saved to ${twitterPath}`);

        // Telegram (portrait)
        const telegramScreenshot = await captureTelegramPortraitScreenshot();
        const telegramPath = path.join(OUTPUT_DIR, `telegram-portrait-local-screenshot-${getTodayDateStr()}.png`);
        fs.writeFileSync(telegramPath, telegramScreenshot);
        console.log(`✅ [Telegram Portrait] Screenshot saved to ${telegramPath}`);
    } catch (err) {
        console.error('❌ Error in test-local-daily.js:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
} 