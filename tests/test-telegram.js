require('dotenv').config();
const { captureScreenshot, sendToTelegram } = require('./telegram.js');

async function testTelegram() {
    try {
        console.log('🧪 Testing Telegram bot functionality...');

        // Test screenshot capture
        console.log('📸 Testing screenshot capture...');
        const screenshot = await captureScreenshot();
        console.log('✅ Screenshot captured successfully');

        // Test Telegram sending
        console.log('📱 Testing Telegram sending...');
        const result = await sendToTelegram(screenshot);
        console.log('✅ Telegram message sent successfully');
        console.log(`📱 Message ID: ${result.message_id}`);

        console.log('🎉 All tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run test
testTelegram(); 