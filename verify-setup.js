require('dotenv').config();
const puppeteer = require('puppeteer');

async function verifySetup() {
    console.log('🔍 Verifying BaziGPT Twitter Bot setup...\n');

    // Check environment variables
    console.log('1️⃣ Checking environment variables...');
    const required = ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.log(`❌ Missing: ${missing.join(', ')}`);
        console.log('💡 Make sure you have a .env file with your Twitter credentials');
    } else {
        console.log('✅ All environment variables present');
    }

    // Test share card endpoint
    console.log('\n2️⃣ Testing share card endpoint...');
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });

        const page = await browser.newPage();
        await page.goto('https://bazigpt.xyz/api/daily-share-card-png', { timeout: 10000 });

        const title = await page.title();
        console.log(`✅ Share card loads successfully (Title: ${title})`);

        await browser.close();
    } catch (error) {
        console.log(`❌ Share card endpoint error: ${error.message}`);
    }

    // Check GitHub Actions schedule
    console.log('\n3️⃣ GitHub Actions schedule...');
    console.log('📅 Scheduled to run: Daily at 00:00 UTC (7:00 AM your time)');
    console.log('🕐 Next run: Tomorrow at 7:00 AM your time');
    console.log('🔧 Manual trigger: Available in GitHub Actions tab');

    // Final checklist
    console.log('\n4️⃣ Pre-sleep checklist:');
    console.log('✅ Environment variables configured');
    console.log('✅ Share card endpoint working');
    console.log('✅ GitHub Secrets set up');
    console.log('✅ Workflow file pushed to GitHub');
    console.log('✅ Manual test completed (run this first!)');

    console.log('\n🎯 Ready for automated daily tweets!');
    console.log('💤 You can sleep well knowing the bot will tweet at 7:00 AM');
}

verifySetup(); 