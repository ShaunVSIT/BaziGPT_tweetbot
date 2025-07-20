require('dotenv').config();

// Import both bot modules
const { main: tweetMain } = require('./tweet.js');
const { main: telegramMain } = require('./telegram-portrait.js');

// Configuration
const SERVICES = {
    TWITTER: 'twitter',
    TELEGRAM: 'telegram'
};

// Check if specific service is enabled via environment
function isServiceEnabled(service) {
    const envVar = `ENABLE_${service.toUpperCase()}`;
    return process.env[envVar] !== 'false'; // Default to true if not set
}

// Run a single service with error handling
async function runService(serviceName, serviceFunction) {
    console.log(`\n🎯 Starting ${serviceName.toUpperCase()} service...`);

    try {
        await serviceFunction();
        console.log(`✅ ${serviceName.toUpperCase()} service completed successfully!`);
        return true;
    } catch (error) {
        console.error(`❌ ${serviceName.toUpperCase()} service failed:`, error.message);
        return false;
    }
}

// Main orchestrator function
async function runAll() {
    console.log('🚀 Starting BaziGPT Multi-Platform Bot...');
    console.log('='.repeat(50));

    const startTime = Date.now();
    const results = {
        twitter: false,
        telegram: false
    };

    // Check which services are enabled
    const enabledServices = [];
    if (isServiceEnabled(SERVICES.TWITTER)) {
        enabledServices.push(SERVICES.TWITTER);
    }
    if (isServiceEnabled(SERVICES.TELEGRAM)) {
        enabledServices.push(SERVICES.TELEGRAM);
    }

    if (enabledServices.length === 0) {
        console.log('⚠️  No services enabled. Set ENABLE_TWITTER=true or ENABLE_TELEGRAM=true');
        return;
    }

    console.log(`📋 Enabled services: ${enabledServices.join(', ')}`);

    // Run Twitter service
    if (enabledServices.includes(SERVICES.TWITTER)) {
        results.twitter = await runService('Twitter', tweetMain);
    }

    // Run Telegram service
    if (enabledServices.includes(SERVICES.TELEGRAM)) {
        results.telegram = await runService('Telegram', telegramMain);
    }

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('📊 EXECUTION SUMMARY');
    console.log('='.repeat(50));

    Object.entries(results).forEach(([service, success]) => {
        if (enabledServices.includes(service)) {
            const status = success ? '✅ SUCCESS' : '❌ FAILED';
            console.log(`${service.toUpperCase()}: ${status}`);
        }
    });

    console.log(`⏱️  Total execution time: ${duration}s`);

    // Exit with error if any service failed
    const allSuccessful = Object.values(results).every(result => result);
    if (!allSuccessful) {
        console.log('\n💥 Some services failed. Check the logs above.');
        process.exit(1);
    } else {
        console.log('\n🎉 All enabled services completed successfully!');
    }
}

// Run if called directly
if (require.main === module) {
    runAll().catch(error => {
        console.error('💥 Fatal error in main process:', error.message);
        process.exit(1);
    });
}

module.exports = { runAll, runService, isServiceEnabled }; 