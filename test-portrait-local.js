require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

// Configuration
const LOCAL_PORTRAIT_URL = 'http://localhost:3001/api/daily-share-card-portrait';

async function capturePortraitScreenshot() {
    console.log('🚀 Launching Puppeteer...');

    const browser = await puppeteer.launch({
        headless: "new", // Use headless mode for clean output
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
        console.log(`📄 Navigating to ${LOCAL_PORTRAIT_URL}...`);
        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport for portrait orientation
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

        // Navigate to local endpoint with better error handling
        console.log('🌐 Attempting to connect to local server...');
        try {
            await page.goto(LOCAL_PORTRAIT_URL, {
                waitUntil: 'networkidle0',
                timeout: 10000 // Reduced timeout for faster failure
            });
        } catch (navigationError) {
            console.error('❌ Failed to connect to local server!');
            console.error('💡 Make sure your local server is running on port 3001');
            console.error('💡 You can start it with: npm run dev (or your local server command)');
            console.error('💡 Expected endpoint: http://localhost:3001/api/daily-share-card-portrait');
            console.error('📝 Error details:', navigationError.message);

            // Keep browser open for debugging
            console.log('🔍 Browser will stay open for debugging...');
            console.log('💡 Check if your local server is running, then refresh the page');
            console.log('💡 Close the browser window when done, or press Ctrl+C to exit');

            await new Promise(() => { }); // Keep script running
            return;
        }

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
        console.log('📸 Taking portrait screenshot...');
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false,
            omitBackground: false,
            clip: {
                x: 0,
                y: 0,
                width: 800,
                height: Math.min(contentHeight, 1200) // Use actual content height but cap at 1200
            }
        });

        // Save screenshot for preview
        const filename = `test-outputs/portrait-preview-${Date.now()}.png`;
        if (!fs.existsSync('test-outputs')) {
            fs.mkdirSync('test-outputs');
        }
        fs.writeFileSync(filename, screenshot);

        console.log('✅ Portrait screenshot captured and saved!');
        console.log(`📁 Saved to: ${filename}`);
        console.log(`📏 Image size: ${screenshot.length} bytes`);
        console.log(`📐 Dimensions: 800x${Math.min(contentHeight, 1200)}`);

        console.log('✅ Test completed successfully!');
        console.log('📁 Check the saved image in test-outputs/ folder');

    } catch (error) {
        console.error('❌ Error capturing screenshot:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
capturePortraitScreenshot().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
}); 