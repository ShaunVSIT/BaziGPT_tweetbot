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
        headless: "new", // Use new headless mode
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

        // Set viewport for consistent rendering (Twitter-optimized)
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

        // Add dynamic text fitting to ensure no text is cut off
        await page.evaluate(() => {
            // Function to ensure text fits within available space
            function ensureTextFits() {
                const forecast = document.querySelector('.forecast');
                const container = document.querySelector('.container');
                const title = document.querySelector('.title');
                const date = document.querySelector('.date');
                const pillar = document.querySelector('.pillar');
                const footer = document.querySelector('.footer');

                if (!forecast || !container) return;

                // Remove any existing line-clamp restrictions
                forecast.style.webkitLineClamp = 'none';
                forecast.style.maxHeight = 'none';
                forecast.style.overflow = 'visible';

                // Calculate available space
                const containerHeight = 630; // Fixed height
                const titleHeight = title ? title.offsetHeight : 0;
                const dateHeight = date ? date.offsetHeight : 0;
                const pillarHeight = pillar ? pillar.offsetHeight : 0;
                const footerHeight = footer ? footer.offsetHeight : 0;
                const margins = 60; // Account for padding and margins

                const availableHeight = containerHeight - titleHeight - dateHeight - pillarHeight - footerHeight - margins;

                // Set forecast to use available space
                forecast.style.maxHeight = `${availableHeight}px`;
                forecast.style.overflow = 'hidden';

                // If text is still overflowing, reduce font size
                let fontSize = 16;
                const originalFontSize = 16;

                while (forecast.scrollHeight > forecast.clientHeight && fontSize > 12) {
                    fontSize -= 0.5;
                    forecast.style.fontSize = `${fontSize}px`;
                }

                // If still overflowing, reduce line height
                if (forecast.scrollHeight > forecast.clientHeight) {
                    let lineHeight = 1.4;
                    while (forecast.scrollHeight > forecast.clientHeight && lineHeight > 1.1) {
                        lineHeight -= 0.05;
                        forecast.style.lineHeight = lineHeight;
                    }
                }

                // If still overflowing, truncate text with ellipsis
                if (forecast.scrollHeight > forecast.clientHeight) {
                    const text = forecast.textContent;
                    let truncatedText = text;
                    let words = text.split(' ');

                    while (forecast.scrollHeight > forecast.clientHeight && words.length > 10) {
                        words.pop();
                        truncatedText = words.join(' ') + '...';
                        forecast.textContent = truncatedText;
                    }
                }

                console.log(`Text fitting complete: Font size: ${fontSize}px, Available height: ${availableHeight}px`);
            }

            // Run text fitting after a short delay to ensure layout is complete
            setTimeout(ensureTextFits, 100);

            // Also run on any layout changes
            const observer = new ResizeObserver(ensureTextFits);
            observer.observe(document.body);
        });

        // Wait for text fitting to complete
        await page.waitForTimeout(2000);

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
        const tweetText = `🗓️ Daily Bazi Forecast – ${todayDate}\n\nCheck your chart → ${BAZI_SITE_URL}\n\n#Bazi #ChineseAstrology #BaziGPT`;

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