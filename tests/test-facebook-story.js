require('dotenv').config();
const { captureStoryScreenshot } = require('../facebookStory');
const fs = require('fs');
const path = require('path');

async function testFacebookStory() {
    try {
        console.log('🧪 Testing Facebook Story functionality...');

        // Test with a sample link
        const testLink = 'https://www.facebook.com/test-post';

        // Capture the story screenshot without posting
        console.log('📸 Capturing story screenshot for preview...');
        const screenshot = await captureStoryScreenshot();

        // Create test-outputs directory if it doesn't exist
        const testOutputsDir = path.join(__dirname, '..', 'test-outputs');
        if (!fs.existsSync(testOutputsDir)) {
            fs.mkdirSync(testOutputsDir, { recursive: true });
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `facebook-story-preview-${timestamp}.png`;
        const filepath = path.join(testOutputsDir, filename);

        // Save the screenshot
        fs.writeFileSync(filepath, screenshot);
        console.log(`✅ Story screenshot saved to: ${filepath}`);
        console.log(`📊 File size: ${(screenshot.length / 1024).toFixed(2)} KB`);

        console.log('\n🎯 To test actual story posting, run: npm run facebook-story');
        console.log('📝 Make sure you have set FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID in your .env file');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testFacebookStory();
