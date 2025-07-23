const puppeteer = require('puppeteer');

async function testEndpoint() {
    console.log('🧪 Testing endpoint accessibility...');

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });

    try {
        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('📄 Navigating to endpoint...');

        // Try with different options
        const response = await page.goto('https://bazigpt.io/api/daily-share-card-png', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        console.log('📊 Response status:', response.status());
        console.log('📄 Response headers:', response.headers());

        // Check if page loaded
        const content = await page.content();
        console.log('📝 Content length:', content.length);
        console.log('📄 First 500 chars:', content.substring(0, 500));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

testEndpoint(); 