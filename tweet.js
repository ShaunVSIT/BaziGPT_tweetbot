require('dotenv').config();
const puppeteer = require('puppeteer');
const { TwitterApi } = require('twitter-api-v2');

// Configuration
const SHARE_CARD_URL = 'https://bazigpt.xyz/api/daily-share-card-png';
const BAZI_SITE_URL = 'bazigpt.xyz';

// Validate environment variables
function validateEnv() {
    const required = [
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_SECRET'
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
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    });

    try {
        console.log(`📄 Navigating to ${SHARE_CARD_URL}...`);
        const page = await browser.newPage();

        // Set viewport for consistent rendering
        await page.setViewport({ width: 1200, height: 630 });

        // Navigate to the share card URL
        await page.goto(SHARE_CARD_URL, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for the body to be fully loaded
        await page.waitForSelector('body', { timeout: 10000 });

        // Additional wait to ensure all content is rendered
        await page.waitForTimeout(2000);

        console.log('📸 Taking screenshot...');
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false
        });

        console.log('✅ Screenshot captured successfully');
        return screenshot;

    } finally {
        await browser.close();
        console.log('🔒 Browser closed');
    }
}

// Initialize Twitter API client
function createTwitterClient() {
    const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    return client;
}

// Upload media and post tweet
async function postTweet(screenshot) {
    console.log('🐦 Initializing Twitter client...');
    const client = createTwitterClient();

    try {
        console.log('📤 Uploading media to Twitter...');
        const mediaId = await client.v1.uploadMedia(screenshot, { mimeType: 'image/png' });

        const todayDate = getTodayDate();
        const tweetText = `🗓️ Daily Bazi Forecast – ${todayDate}\nCheck your chart → ${BAZI_SITE_URL}\n#Bazi #ChineseAstrology #BaziGPT`;

        console.log('📝 Posting tweet...');
        const tweet = await client.v2.tweet({
            text: tweetText,
            media: { media_ids: [mediaId] }
        });

        console.log('✅ Tweet posted successfully!');
        console.log(`🔗 Tweet URL: https://twitter.com/user/status/${tweet.data.id}`);

        return tweet;

    } catch (error) {
        console.error('❌ Error posting tweet:', error.message);
        throw error;
    }
}

// Main function
async function main() {
    try {
        console.log('🎯 Starting BaziGPT Twitter Bot...');

        // Validate environment variables
        validateEnv();
        console.log('✅ Environment variables validated');

        // Capture screenshot
        const screenshot = await captureScreenshot();

        // Post tweet
        await postTweet(screenshot);

        console.log('🎉 Daily Bazi forecast tweeted successfully!');

    } catch (error) {
        console.error('💥 Error in main process:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, captureScreenshot, postTweet }; 