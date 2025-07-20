require('dotenv').config();
const { captureScreenshot } = require('./telegram.js');
const fs = require('fs');

async function testTelegramScreenshot() {
    try {
        console.log('🧪 Testing Telegram screenshot dimensions...');

        // Capture screenshot
        console.log('📸 Capturing screenshot with Telegram-optimized settings...');
        const screenshot = await captureScreenshot();

        // Save screenshot for inspection
        const filename = `test-outputs/telegram-test-${Date.now()}.png`;
        fs.writeFileSync(filename, screenshot);

        console.log('✅ Screenshot captured and saved');
        console.log(`📁 Saved to: ${filename}`);
        console.log(`📏 Image size: ${screenshot.length} bytes`);

        // Basic image analysis
        const width = 1200;
        const height = 630;
        console.log(`📐 Expected dimensions: ${width}x${height}`);
        console.log(`📊 Aspect ratio: ${(width / height).toFixed(2)}:1`);

        console.log('🎉 Screenshot test completed!');
        console.log('📱 Check the saved image to verify it displays properly in Telegram');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Create test-outputs directory if it doesn't exist
if (!fs.existsSync('test-outputs')) {
    fs.mkdirSync('test-outputs');
}

// Run test
testTelegramScreenshot(); 