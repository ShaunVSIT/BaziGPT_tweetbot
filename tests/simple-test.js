const puppeteer = require('puppeteer');

async function simpleTest() {
    console.log('🧪 Simple Puppeteer test...');

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        console.log('✅ Browser launched successfully');

        const page = await browser.newPage();
        console.log('✅ Page created successfully');

        await page.goto('https://www.google.com', { timeout: 10000 });
        console.log('✅ Navigated to Google successfully');

        const title = await page.title();
        console.log('📄 Page title:', title);

        await browser.close();
        console.log('✅ Test completed successfully');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

simpleTest(); 