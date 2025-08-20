require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const SHARE_CARD_URL = 'https://bazigpt.io/api/daily-share-card-portrait';
const BAZI_SITE_URL = 'bazigpt.io';
const BAZI_SITE_DAILY_URL = 'bazigpt.io/daily';

// Story dimensions (Instagram/Facebook story format)
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

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

// Capture story screenshot using Puppeteer with story dimensions
async function captureStoryScreenshot() {
    console.log('🚀 Launching Puppeteer for story...');

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
        console.log(`📄 Navigating to ${SHARE_CARD_URL} for story...`);
        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport for story dimensions (1080x1920)
        await page.setViewport({
            width: STORY_WIDTH,
            height: STORY_HEIGHT,
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

        console.log('✅ Page has content for story');

        // First, take a screenshot of the original content to get the top section
        console.log('📸 Capturing original content...');

        // Calculate the crop area to get just title, date, and elements
        const originalViewportHeight = 1200; // Original card height
        const cropHeight = Math.round(originalViewportHeight * 0.22); // 25% of original content

        const originalScreenshot = await page.screenshot({
            type: 'png',
            fullPage: false,
            omitBackground: false,
            clip: {
                x: 0,
                y: 0,
                width: 800, // Original card width
                height: cropHeight
            }
        });

        console.log('🎨 Creating story canvas and overlaying content...');

        // Read and encode the logo
        const fs = require('fs');
        const path = require('path');
        const logoPath = path.join(__dirname, 'public', 'bazigpt.png');
        let logoBase64 = '';
        try {
            const logoBuffer = fs.readFileSync(logoPath);
            logoBase64 = logoBuffer.toString('base64');
        } catch (error) {
            console.log('⚠️ Logo file not found, continuing without logo');
        }

        // Create a new page for the story canvas
        const storyPage = await browser.newPage();
        await storyPage.setViewport({
            width: STORY_WIDTH,
            height: STORY_HEIGHT,
            deviceScaleFactor: 2
        });

        // Create the story canvas with the cropped content and enhanced styling
        await storyPage.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        width: ${STORY_WIDTH}px;
                        height: ${STORY_HEIGHT}px;
                        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    /* Background decorative circles */
                    .bg-circle {
                        position: absolute;
                        border: 2px solid #FF8C00;
                        border-radius: 50%;
                        opacity: 0.3;
                    }
                    .bg-circle-1 {
                        width: 300px;
                        height: 300px;
                        top: -150px;
                        left: -150px;
                    }
                    .bg-circle-2 {
                        width: 200px;
                        height: 200px;
                        top: 50px;
                        right: -100px;
                    }
                    .bg-circle-3 {
                        width: 250px;
                        height: 250px;
                        bottom: -125px;
                        left: 50px;
                    }
                    .bg-circle-4 {
                        width: 180px;
                        height: 180px;
                        bottom: 100px;
                        right: -90px;
                    }
                    .bg-circle-5 {
                        width: 120px;
                        height: 120px;
                        top: 300px;
                        left: 100px;
                    }
                    .bg-circle-6 {
                        width: 150px;
                        height: 150px;
                        top: 200px;
                        right: 200px;
                    }
                    
                    .content-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                        position: relative;
                    }
                    
                    .logo-section {
                        position: absolute;
                        top: 160px;
                        display: flex;
                        align-items: center;
                        gap: 24px;
                    }
                    
                    .logo-image {
                        width: 100px;
                        height: 100px;
                        border-radius: 20px;
                    }
                    
                    .logo-text {
                        font-size: 48px;
                        font-weight: 900;
                        color: #FF8C00;
                        text-shadow: 0 5px 12px rgba(0,0,0,0.8);
                    }
                    
                    .content-image {
                        max-width: 95%;
                        max-height: 40%;
                        border-radius: 20px;
                        box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                        margin-top: -40px;
                        margin-bottom: 300px;
                    }
                    
                    .cta-section {
                        text-align: center;
                        margin-top: 0px;
                    }
                    
                    .cta-main {
                        font-size: 64px;
                        font-weight: 900;
                        color: #FF8C00;
                        margin-bottom: 36px;
                        text-shadow: 0 5px 10px rgba(0,0,0,0.8);
                        line-height: 0.9;
                    }
                    
                    .cta-sub {
                        font-size: 38px;
                        color: #FFFFFF;
                        opacity: 0.95;
                        margin-bottom: 56px;
                        font-weight: 700;
                        line-height: 1.0;
                        max-width: 85%;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    
                    .tap-indicator {
                        display: inline-block;
                        background: linear-gradient(45deg, #FF8C00, #FFA500);
                        color: white;
                        padding: 32px 80px;
                        border-radius: 50px;
                        font-size: 32px;
                        font-weight: 900;
                        box-shadow: 0 20px 50px rgba(255, 140, 0, 0.6);
                        animation: pulse 2s infinite;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                </style>
            </head>
            <body>
                <!-- Background decorative circles -->
                <div class="bg-circle bg-circle-1"></div>
                <div class="bg-circle bg-circle-2"></div>
                <div class="bg-circle bg-circle-3"></div>
                <div class="bg-circle bg-circle-4"></div>
                <div class="bg-circle bg-circle-5"></div>
                <div class="bg-circle bg-circle-6"></div>
                
                <div class="content-container">
                    <div class="logo-section">
                        ${logoBase64 ? `<img class="logo-image" src="data:image/png;base64,${logoBase64}" />` : ''}
                        <div class="logo-text">BaziGPT</div>
                    </div>
                    
                    <img class="content-image" src="data:image/png;base64,${originalScreenshot.toString('base64')}" />
                    
                    <div class="cta-section">
                        <div class="cta-main">🔮 Your Daily Bazi Awaits</div>
                        <div class="cta-sub">Discover how the cosmic energies align today and what it means for you!</div>
                        <div class="tap-indicator">📖 FULL FORECAST ON OUR PAGE</div>
                    </div>
                </div>
            </body>
            </html>
        `);

        // Wait for the content to render
        await storyPage.waitForTimeout(1000);

        // Take the final story screenshot
        console.log('📸 Taking final story screenshot...');
        const screenshot = await storyPage.screenshot({
            type: 'png',
            fullPage: false,
            omitBackground: false
        });

        await storyPage.close();

        console.log('✅ Story screenshot captured successfully');
        return screenshot;

    } finally {
        await browser.close();
        console.log('🔒 Browser closed');
    }
}

// Post story image to Facebook page using the stories endpoint
async function postStoryToFacebook(imageBuffer) {
    console.log('📱 Posting story to Facebook page...');

    try {
        const todayDate = getTodayDate();

        // Create story message - shorter and more engaging for stories
        let storyMessage = `🗓️ Daily Bazi Forecast – ${todayDate}\n\nCheck our page for full reading! 📖`;

        // Step 1: Upload the story photo first (unpublished)
        console.log('📤 Step 1: Uploading story photo...');
        const photoFormData = new FormData();
        photoFormData.append('source', imageBuffer, {
            filename: 'daily-bazi-story.png',
            contentType: 'image/png'
        });
        photoFormData.append('published', 'false');
        photoFormData.append('access_token', process.env.FACEBOOK_PAGE_ACCESS_TOKEN);

        const photoResponse = await axios.post(
            `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
            photoFormData,
            {
                headers: {
                    ...photoFormData.getHeaders(),
                }
            }
        );

        const photoId = photoResponse.data.id;
        console.log('✅ Photo uploaded successfully, ID:', photoId);

        // Step 2: Create the story using the photo ID
        console.log('📱 Step 2: Creating story with photo...');

        // Create story without link (Facebook Stories don't support clickable links)
        const storyData = {
            photo_id: photoId,
            access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
        };

        response = await axios.post(
            `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/photo_stories`,
            storyData
        );

        console.log('✅ Story created successfully');

        console.log('✅ Facebook story posted successfully!');
        console.log('📊 Full response:', JSON.stringify(response.data, null, 2));

        // The photo_stories endpoint might return success status instead of ID
        const storyId = response.data.id || response.data.post_id || 'Success';
        console.log(`🔗 Story ID: ${storyId}`);

        return response.data;

    } catch (error) {
        console.error('❌ Error posting story to Facebook:', error.response?.data || error.message);
        throw error;
    }
}

// Main function for posting story
async function postFacebookStory(reading = null) {
    try {
        console.log('🎯 Starting BaziGPT Facebook Story Bot...');

        // Validate environment variables
        validateEnv();
        console.log('✅ Environment variables validated');

        // Capture story screenshot
        const screenshot = await captureStoryScreenshot();

        // Post story to Facebook page
        const storyResult = await postStoryToFacebook(screenshot);

        console.log('🎉 Daily Bazi story posted to Facebook successfully!');
        return storyResult;

    } catch (error) {
        console.error('💥 Error in story posting process:', error.message);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    postFacebookStory();
}

module.exports = {
    postFacebookStory,
    captureStoryScreenshot,
    postStoryToFacebook
};
