# BaziGPT Twitter Bot

A Twitter bot that automatically posts daily Bazi forecasts with share cards from [BaziGPT](https://bazigpt.io/daily).

## Features

- 🗓️ **Daily Automation**: Posts every day at midnight UTC via GitHub Actions
- 📸 **Screenshot Generation**: Uses Puppeteer to capture share cards from your API
- 🐦 **Twitter Integration**: Seamlessly uploads and tweets with proper formatting
- 🔒 **Secure**: Uses GitHub Secrets for API credentials
- 🚀 **Production Ready**: Includes error handling and logging

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd bazigpt_tweetbot
npm install
```

### 2. Set Up Twitter API Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use existing one
3. Generate API keys and access tokens
4. Copy `env.example` to `.env` and fill in your credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual Twitter API credentials:
```
TWITTER_API_KEY=your_actual_api_key
TWITTER_API_SECRET=your_actual_api_secret
TWITTER_ACCESS_TOKEN=your_actual_access_token
TWITTER_ACCESS_SECRET=your_actual_access_secret
```

### 3. Test Locally

```bash
npm start
```

This will:
- Launch Puppeteer and navigate to your share card endpoint
- Capture a screenshot
- Post a test tweet with today's date

## GitHub Actions Deployment

### 1. Set Up Repository Secrets

In your GitHub repository settings, go to **Settings → Secrets and variables → Actions** and add these secrets:

- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`

### 2. Push to GitHub

The workflow will automatically:
- Run daily at midnight UTC
- Install dependencies
- Execute the bot with your secrets

### 3. Manual Testing

You can manually trigger the workflow:
1. Go to **Actions** tab in your repository
2. Select **Daily Bazi Tweet** workflow
3. Click **Run workflow**

## How It Works

1. **Screenshot Capture**: Puppeteer loads `https://bazigpt.io/api/daily-share-card-png` and captures a PNG
2. **Twitter Upload**: The PNG is uploaded to Twitter as media
3. **Tweet Posting**: A formatted tweet is posted with the image and today's date
4. **Automation**: GitHub Actions runs this process daily at midnight UTC

## Tweet Format

```
🗓️ Daily Bazi Forecast – July 20, 2025
Check your chart → bazigpt.io
#Bazi #ChineseAstrology #BaziGPT
```

## Error Handling

The bot includes comprehensive error handling for:
- Missing environment variables
- Puppeteer screenshot failures
- Twitter API errors
- Network timeouts

All errors are logged with clear messages for debugging.

## Development

### Project Structure

```
bazigpt_tweetbot/
├── tweet.js              # Main bot logic
├── package.json          # Dependencies and scripts
├── env.example          # Environment template
├── .github/workflows/   # GitHub Actions
│   └── tweet-daily.yml
└── README.md           # This file
```

### Dependencies

- **puppeteer**: Browser automation for screenshots
- **twitter-api-v2**: Modern Twitter API client
- **dotenv**: Environment variable management

## Troubleshooting

### Common Issues

1. **Puppeteer fails in GitHub Actions**
   - The workflow includes necessary flags for headless Chrome
   - Uses Ubuntu latest runner for compatibility

2. **Twitter API errors**
   - Verify your API credentials are correct
   - Ensure your app has the right permissions
   - Check rate limits

3. **Screenshot issues**
   - The bot waits for full page load
   - Includes additional render time
   - Uses consistent viewport settings

### Debug Mode

For local debugging, you can modify `tweet.js` to save screenshots:

```javascript
// In captureScreenshot function, add:
await page.screenshot({ path: 'debug.png', fullPage: false });
```

## License

MIT License - feel free to use and modify as needed.

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify your Twitter API credentials
3. Test locally first with `npm start` 