require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');
const { postFacebookStory } = require('./facebookStory');

// Configuration
const SHARE_CARD_URL = 'https://bazigpt.io/api/daily-share-card-portrait';
const BAZI_SITE_URL = 'bazigpt.io';
const BAZI_SITE_DAILY_URL = 'bazigpt.io/daily';

// Validate environment variables
function validateEnv() {
    const required = [
        'FACEBOOK_PAGE_ACCESS_TOKEN',
        'FACEBOOK_PAGE_ID'
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

// Capture screenshot using Puppeteer (same as Twitter bot)
async function captureScreenshot() {
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
        console.log(`📄 Navigating to ${SHARE_CARD_URL}...`);
        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport for portrait orientation (optimized for mobile)
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

        // Force font loading by rendering Chinese characters
        await page.evaluate(() => {
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.left = '-9999px';
            testElement.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
            testElement.textContent = '天地玄黄宇宙洪荒日月盈昃辰宿列张';
            document.body.appendChild(testElement);
            testElement.offsetHeight;
        });

        await page.goto(SHARE_CARD_URL, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for fonts to fully load and render
        await page.waitForTimeout(5000);

        // Check if page has content
        const hasContent = await page.evaluate(() => {
            return document.body && document.body.innerHTML.length > 0;
        });

        if (!hasContent) {
            throw new Error('Page has no content - body is empty');
        }

        console.log('✅ Page has content');

        // Get actual content height with better error handling
        const contentHeight = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;

            // Debug: Check if elements exist
            if (!body || !html) {
                console.error('❌ Body or HTML element is null');
                return 1200; // Default height
            }

            const height = Math.max(
                body.scrollHeight || 0,
                body.offsetHeight || 0,
                html.clientHeight || 0,
                html.scrollHeight || 0,
                html.offsetHeight || 0
            );

            console.log('📐 Debug - Body scrollHeight:', body.scrollHeight);
            console.log('📐 Debug - HTML scrollHeight:', html.scrollHeight);
            console.log('📐 Debug - Calculated height:', height);

            return height || 1200; // Fallback to 1200 if all are 0
        });

        console.log('📐 Actual content height:', contentHeight, 'px');
        console.log('📐 Portrait viewport: 800x1200');

        // Take screenshot with portrait dimensions
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

        console.log('✅ Screenshot captured successfully');
        return screenshot;

    } finally {
        await browser.close();
        console.log('🔒 Browser closed');
    }
}

// Post image with caption to Facebook page in a single API call
async function postToFacebook(imageBuffer) {
    console.log('📘 Posting to Facebook page...');

    try {
        const todayDate = getTodayDate();
        const postMessage = `🗓️ Daily Bazi Forecast – ${todayDate}\n\nUnlock your exclusive Bazi forecast, today's guidance is only available for a limited time! → ${BAZI_SITE_DAILY_URL}\n\n#Bazi #ChineseAstrology #BaziGPT #DailyForecast`;

        // Create form data with both image and message
        const formData = new FormData();
        formData.append('source', imageBuffer, {
            filename: 'daily-bazi-forecast.png',
            contentType: 'image/png'
        });
        formData.append('message', postMessage);
        formData.append('access_token', process.env.FACEBOOK_PAGE_ACCESS_TOKEN);

        // Post image with caption in a single API call
        const response = await axios.post(
            `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                }
            }
        );

        console.log('✅ Facebook post created successfully!');
        console.log(`🔗 Post ID: ${response.data.id}`);

        // Get the permalink for the post
        const permalink = `https://www.facebook.com/${process.env.FACEBOOK_PAGE_ID}/posts/${response.data.id}`;
        console.log(`🔗 Post permalink: ${permalink}`);

        return {
            ...response.data,
            permalink: permalink
        };

    } catch (error) {
        console.error('❌ Error posting to Facebook:', error.response?.data || error.message);
        throw error;
    }
}



// Main function
async function main() {
    try {
        console.log('🎯 Starting BaziGPT Facebook Bot...');

        // Validate environment variables
        validateEnv();
        console.log('✅ Environment variables validated');

        // Capture screenshot
        const screenshot = await captureScreenshot();

        // Post to Facebook page with image and caption
        // const postResult = await postToFacebook(screenshot);

        // console.log('🎉 Daily Bazi forecast posted to Facebook successfully!');
        console.log('Skipping Facebook post');

        // Post story version
        try {
            console.log('📱 Posting story version...');
            await postFacebookStory(null);
            console.log('🎉 Story posted successfully!');
        } catch (storyError) {
            console.error('⚠️ Warning: Story posting failed, but feed post was successful:', storyError.message);
            // Don't fail the entire process if story posting fails
        }

    } catch (error) {
        console.error('💥 Error in main process:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, captureScreenshot, postToFacebook };
