require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

// Configuration - use production endpoint
const PRODUCTION_URL = 'https://bazigpt.io/api/daily-share-card-png';

async function captureLandscapeInPortrait() {
    console.log('🚀 Launching Puppeteer...');

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
        console.log(`📄 Navigating to ${PRODUCTION_URL}...`);
        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport for portrait orientation (this will show the issue)
        await page.setViewport({
            width: 800,
            height: 1200, // Portrait orientation
            deviceScaleFactor: 2
        });

        // Enhanced Chinese font loading
        await page.evaluateOnNewDocument(() => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap';
            document.head.appendChild(link);

            document.body.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
        });

        // Wait for fonts to load
        await page.waitForTimeout(2000);

        // Force font loading
        await page.evaluate(() => {
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.left = '-9999px';
            testElement.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
            testElement.textContent = '天地玄黄宇宙洪荒日月盈昃辰宿列张';
            document.body.appendChild(testElement);
            testElement.offsetHeight;
        });

        // Navigate to production endpoint
        console.log('🌐 Connecting to production endpoint...');
        await page.goto(PRODUCTION_URL, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForTimeout(3000);

        // Get actual content dimensions
        const contentInfo = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            const contentHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
            const contentWidth = Math.max(
                body.scrollWidth,
                body.offsetWidth,
                html.clientWidth,
                html.scrollWidth,
                html.offsetWidth
            );
            return { contentHeight, contentWidth };
        });

        console.log('📐 Content dimensions:', contentInfo);
        console.log('📐 Portrait viewport: 800x1200');
        console.log('💡 This shows the current landscape layout in portrait viewport');

        // Take screenshot
        console.log('📸 Taking screenshot of landscape layout in portrait viewport...');
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false,
            omitBackground: false,
            clip: {
                x: 0,
                y: 0,
                width: 800,
                height: 1200
            }
        });

        // Save screenshot for preview
        const filename = `test-outputs/landscape-in-portrait-${Date.now()}.png`;
        if (!fs.existsSync('test-outputs')) {
            fs.mkdirSync('test-outputs');
        }
        fs.writeFileSync(filename, screenshot);

        console.log('✅ Screenshot captured and saved!');
        console.log(`📁 Saved to: ${filename}`);
        console.log(`📏 Image size: ${screenshot.length} bytes`);
        console.log(`📐 Dimensions: 800x1200`);
        console.log('💡 This shows why we need a proper portrait layout!');

    } catch (error) {
        console.error('❌ Error capturing screenshot:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
captureLandscapeInPortrait().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
}); 