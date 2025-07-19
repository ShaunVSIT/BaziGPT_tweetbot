const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testShareCard() {
    console.log('🧪 Testing share card formatting...');

    const browser = await puppeteer.launch({
        headless: true,
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
        console.log('📄 Loading share card from endpoint...');
        const page = await browser.newPage();

        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport for consistent rendering
        await page.setViewport({
            width: 1200,
            height: 630,
            deviceScaleFactor: 2
        });

        // Navigate to the share card URL
        await page.goto('https://bazigpt.xyz/api/daily-share-card-png', {
            waitUntil: 'load',
            timeout: 30000
        });

        // Wait for rendering
        await page.waitForTimeout(3000);

        // Create output directory if it doesn't exist
        const outputDir = './test-outputs';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `share-card-${timestamp}.png`;
        const filepath = path.join(outputDir, filename);

        console.log('📸 Taking screenshot...');
        await page.screenshot({
            path: filepath,
            type: 'png',
            fullPage: false
        });

        console.log(`✅ Screenshot saved to: ${filepath}`);

        // Also save the HTML for inspection
        const htmlContent = await page.content();
        const htmlFilename = `share-card-${timestamp}.html`;
        const htmlFilepath = path.join(outputDir, htmlFilename);
        fs.writeFileSync(htmlFilepath, htmlContent);
        console.log(`📄 HTML saved to: ${htmlFilepath}`);

        // Get page title and dimensions
        const title = await page.title();
        const dimensions = await page.evaluate(() => ({
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight
        }));

        console.log('📊 Page info:');
        console.log(`   Title: ${title}`);
        console.log(`   Dimensions: ${dimensions.width}x${dimensions.height}`);
        console.log(`   Viewport: 1200x630 (2x scale)`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
        console.log('🔒 Browser closed');
    }
}

// Run the test
testShareCard(); 