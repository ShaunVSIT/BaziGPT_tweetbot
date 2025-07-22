require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

async function testSimpleTweet() {
    try {
        console.log('🐦 Testing Twitter API with simple tweet...');

        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        console.log('📝 Posting simple test tweet...');
        const tweet = await client.v2.tweet({
            text: '🧪 Testing BaziGPT Twitter bot - ' + new Date().toLocaleDateString()
        });

        console.log('✅ Simple tweet posted successfully!');
        console.log(`🔗 Tweet URL: https://twitter.com/user/status/${tweet.data.id}`);

    } catch (error) {
        console.error('❌ Error posting simple tweet:', error.message);
        console.error('Full error:', error);
    }
}

testSimpleTweet(); 