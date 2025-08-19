# Facebook Integration Setup Guide for BaziGPT

This guide will help you set up automated daily Facebook posts for your BaziGPT page using the Facebook Graph API.

## Prerequisites

1. ✅ Facebook Page created for BaziGPT
2. ✅ Meta Developer App registered
3. ✅ Facebook Login product added to your app

## Step-by-Step Setup

### 1. Get Your Facebook App Credentials

1. Go to [Meta Developers](https://developers.facebook.com/)
2. Select your BaziGPT app
3. Note down your **App ID** and **App Secret** from the app dashboard

### 2. Get Page Access Token

1. In your app dashboard, go to **Tools** → **Graph API Explorer**
2. Select your app from the dropdown
3. Click **Get Page Access Token**
4. Grant the following permissions:
   - `pages_manage_posts` - To create posts on your page
   - `pages_read_engagement` - To read page insights
5. Copy the generated **Page Access Token**

### 3. Get Your Page ID

1. Go to your Facebook page
2. Look at the URL: `https://www.facebook.com/YourPageName`
3. Or go to **Page Settings** → **Page Info** to find the **Page ID**

### 4. Configure Environment Variables

1. Copy your `.env.example` to `.env` (if you haven't already)
2. Add these Facebook credentials:

```bash
# Facebook Page Credentials
FACEBOOK_PAGE_ACCESS_TOKEN=your_actual_page_access_token_here
FACEBOOK_PAGE_ID=your_actual_page_id_here
```

### 5. Test the Integration

1. **Test screenshot capture only:**
   ```bash
   npm run test-facebook
   ```

2. **Test full Facebook posting:**
   ```bash
   npm run facebook
   ```

## How It Works

The Facebook bot follows the same workflow as your Telegram portrait bot:

1. **Screenshot Capture**: Uses Puppeteer to capture the daily Bazi share card in portrait orientation (800x1200)
2. **Single API Call**: Posts the image with caption to Facebook in one API call using the photos endpoint
3. **Portrait Format**: Optimized for mobile viewing with proper Chinese font rendering
4. **Scheduling**: Can be run daily via GitHub Actions or cron job

## Post Format

Each Facebook post includes:
- 📅 Date header
- 🎯 Call-to-action text
- 🔗 Link to your daily forecast page
- 🏷️ Relevant hashtags (#Bazi, #ChineseAstrology, #BaziGPT, #DailyForecast)

## Troubleshooting

### Common Issues

1. **"Invalid access token"**
   - Ensure your Page Access Token is correct
   - Check if the token has expired
   - Verify the token has the required permissions

2. **"Page not found"**
   - Double-check your Page ID
   - Ensure the Page ID matches the page where you got the access token

3. **"Permission denied"**
   - Make sure you have `pages_manage_posts` permission
   - Verify you're using a Page Access Token, not a User Access Token

### Testing Steps

1. **Test screenshot capture first:**
   ```bash
   npm run test-facebook
   ```

2. **Verify environment variables:**
   ```bash
   node -e "require('dotenv').config(); console.log('FB Token:', process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? 'Set' : 'Missing'); console.log('FB Page ID:', process.env.FACEBOOK_PAGE_ID || 'Missing');"
   ```

3. **Test with a small image first** to ensure the API calls work

## Security Notes

- 🔒 Never commit your `.env` file to version control
- 🔑 Keep your Page Access Token secure
- 📱 Consider using a long-lived token for production use
- ⚠️ The token grants posting access to your page - keep it private

## Next Steps

Once everything is working:

1. **Set up daily automation** using GitHub Actions (recommended) or cron jobs
2. **Add GitHub Secrets** for `FACEBOOK_PAGE_ACCESS_TOKEN` and `FACEBOOK_PAGE_ID`
3. **Monitor your posts** to ensure they're appearing correctly
4. **Adjust post timing** based on your audience's engagement patterns
5. **Consider A/B testing** different post formats and hashtags

## GitHub Actions Setup

1. **Add Secrets** to your GitHub repository:
   - Go to Settings → Secrets and variables → Actions
   - Add `FACEBOOK_PAGE_ACCESS_TOKEN` with your page access token
   - Add `FACEBOOK_PAGE_ID` with your page ID

2. **Enable the workflow**:
   - The workflow will run automatically at 00:15 UTC daily
   - You can also trigger it manually via GitHub Actions tab

## Support

If you encounter issues:
1. Check the Facebook Graph API documentation
2. Verify your app's permissions in Meta Developer Dashboard
3. Test with the Facebook Graph API Explorer tool
4. Check the console output for detailed error messages

---

**Happy posting! 🎉**
