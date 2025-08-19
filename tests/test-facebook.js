require('dotenv').config();
const { captureScreenshot } = require('../facebook.js');

async function testFacebookIntegration() {
    try {
        console.log('🧪 Testing Facebook Integration...\n');

        // Test 1: Screenshot capture
        console.log('📸 Test 1: Capturing screenshot...');
        const screenshot = await captureScreenshot();
        console.log(`✅ Screenshot captured: ${screenshot.length} bytes\n`);

        // Test 2: Image upload and posting (commented out to avoid actual posting during testing)
        console.log('📤 Test 2: Image upload simulation...');
        console.log('⚠️  Skipping actual Facebook posting to avoid test posts');
        console.log('✅ Facebook integration test completed successfully!');

        console.log('\n🎯 To test actual posting, run: npm run facebook');
        console.log('📝 Make sure you have set FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID in your .env file');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run test
testFacebookIntegration();
