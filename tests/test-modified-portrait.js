const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testModifiedPortrait() {
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
        console.log('📄 Loading modified portrait layout...');
        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport for portrait orientation
        await page.setViewport({
            width: 800,
            height: 1200,
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

        // Load the modified HTML file
        const htmlPath = path.join(__dirname, 'portrait-layout-modified.html');
        await page.goto(`file://${htmlPath}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForTimeout(3000);

        // Get actual content height
        const contentHeight = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            return Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
        });

        console.log('📐 Actual content height:', contentHeight, 'px');
        console.log('📐 Portrait viewport: 800x1200');

        // Take screenshot
        console.log('📸 Taking modified portrait screenshot...');
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

        // Save screenshot for preview
        const filename = `test-outputs/modified-portrait-${Date.now()}.png`;
        if (!fs.existsSync('test-outputs')) {
            fs.mkdirSync('test-outputs');
        }
        fs.writeFileSync(filename, screenshot);

        console.log('✅ Modified portrait screenshot captured and saved!');
        console.log(`📁 Saved to: ${filename}`);
        console.log(`📏 Image size: ${screenshot.length} bytes`);
        console.log(`📐 Dimensions: 800x${Math.min(contentHeight, 1200)}`);

        console.log('✅ Test completed successfully!');
        console.log('📁 Check the saved image in test-outputs/ folder');
        console.log('💡 The text bounding box should now sit above the bottom circular graphic');

    } catch (error) {
        console.error('❌ Error capturing screenshot:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
testModifiedPortrait().catch(console.error); 