const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testTwitterTextFitting() {
    console.log('🧪 Testing Twitter text fitting...');

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
        console.log('📄 Loading share card from endpoint...');
        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport for consistent rendering (Twitter-optimized)
        await page.setViewport({
            width: 1200,
            height: 630,
            deviceScaleFactor: 2 // Higher resolution
        });

        // Enhanced Chinese font loading
        await page.evaluateOnNewDocument(() => {
            // Force font loading for Chinese characters
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap';
            document.head.appendChild(link);

            // Set comprehensive fallback fonts for Chinese characters
            document.body.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
        });

        // Wait for fonts to load
        await page.waitForTimeout(2000);

        // Force font loading by rendering Chinese characters
        await page.evaluate(() => {
            // Create a hidden element with Chinese text to force font loading
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.left = '-9999px';
            testElement.style.fontFamily = '"Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei", "SimSun", "WenQuanYi Micro Hei", sans-serif';
            testElement.textContent = '天地玄黄宇宙洪荒日月盈昃辰宿列张';
            document.body.appendChild(testElement);

            // Force a repaint
            testElement.offsetHeight;
        });

        // Navigate with simpler settings
        await page.goto('https://bazigpt.io/api/daily-share-card-png', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for fonts to fully load and render
        await page.waitForTimeout(5000);

        // Add dynamic text fitting to ensure no text is cut off
        await page.evaluate(() => {
            // Function to ensure text fits within available space
            function ensureTextFits() {
                const forecast = document.querySelector('.forecast');
                const container = document.querySelector('.container');
                const title = document.querySelector('.title');
                const date = document.querySelector('.date');
                const pillar = document.querySelector('.pillar');
                const footer = document.querySelector('.footer');

                if (!forecast || !container) return;

                // Remove any existing line-clamp restrictions
                forecast.style.webkitLineClamp = 'none';
                forecast.style.maxHeight = 'none';
                forecast.style.overflow = 'visible';

                // Calculate available space
                const containerHeight = 630; // Fixed height
                const titleHeight = title ? title.offsetHeight : 0;
                const dateHeight = date ? date.offsetHeight : 0;
                const pillarHeight = pillar ? pillar.offsetHeight : 0;
                const footerHeight = footer ? footer.offsetHeight : 0;
                const margins = 60; // Account for padding and margins

                const availableHeight = containerHeight - titleHeight - dateHeight - pillarHeight - footerHeight - margins;

                // Set forecast to use available space
                forecast.style.maxHeight = `${availableHeight}px`;
                forecast.style.overflow = 'hidden';

                // If text is still overflowing, reduce font size
                let fontSize = 16;
                const originalFontSize = 16;

                while (forecast.scrollHeight > forecast.clientHeight && fontSize > 12) {
                    fontSize -= 0.5;
                    forecast.style.fontSize = `${fontSize}px`;
                }

                // If still overflowing, reduce line height
                if (forecast.scrollHeight > forecast.clientHeight) {
                    let lineHeight = 1.4;
                    while (forecast.scrollHeight > forecast.clientHeight && lineHeight > 1.1) {
                        lineHeight -= 0.05;
                        forecast.style.lineHeight = lineHeight;
                    }
                }

                // If still overflowing, truncate text with ellipsis
                if (forecast.scrollHeight > forecast.clientHeight) {
                    const text = forecast.textContent;
                    let truncatedText = text;
                    let words = text.split(' ');

                    while (forecast.scrollHeight > forecast.clientHeight && words.length > 10) {
                        words.pop();
                        truncatedText = words.join(' ') + '...';
                        forecast.textContent = truncatedText;
                    }
                }

                console.log(`Text fitting complete: Font size: ${fontSize}px, Available height: ${availableHeight}px`);

                // Log the final text content to verify it's not cut off
                console.log('Final text content:', forecast.textContent.substring(0, 100) + '...');
            }

            // Run text fitting after a short delay to ensure layout is complete
            setTimeout(ensureTextFits, 100);

            // Also run on any layout changes
            const observer = new ResizeObserver(ensureTextFits);
            observer.observe(document.body);
        });

        // Wait for text fitting to complete
        await page.waitForTimeout(2000);

        // Create output directory if it doesn't exist
        const outputDir = './test-outputs';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `twitter-text-fitting-${timestamp}.png`;
        const filepath = path.join(outputDir, filename);

        console.log('📸 Taking screenshot...');
        await page.screenshot({
            path: filepath,
            type: 'png',
            fullPage: false,
            omitBackground: false
        });

        console.log(`✅ Screenshot saved to: ${filepath}`);

        // Also save the HTML for inspection
        const htmlContent = await page.content();
        const htmlFilename = `twitter-text-fitting-${timestamp}.html`;
        const htmlFilepath = path.join(outputDir, htmlFilename);
        fs.writeFileSync(htmlFilepath, htmlContent);
        console.log(`📄 HTML saved to: ${htmlFilepath}`);

        // Get text fitting results
        const textFittingResults = await page.evaluate(() => {
            const forecast = document.querySelector('.forecast');
            if (!forecast) return null;

            return {
                fontSize: parseFloat(getComputedStyle(forecast).fontSize),
                lineHeight: parseFloat(getComputedStyle(forecast).lineHeight),
                maxHeight: parseFloat(getComputedStyle(forecast).maxHeight),
                scrollHeight: forecast.scrollHeight,
                clientHeight: forecast.clientHeight,
                textLength: forecast.textContent.length,
                isOverflowing: forecast.scrollHeight > forecast.clientHeight
            };
        });

        console.log('📊 Text fitting results:');
        console.log(`   Font size: ${textFittingResults.fontSize}px`);
        console.log(`   Line height: ${textFittingResults.lineHeight}`);
        console.log(`   Max height: ${textFittingResults.maxHeight}px`);
        console.log(`   Scroll height: ${textFittingResults.scrollHeight}px`);
        console.log(`   Client height: ${textFittingResults.clientHeight}px`);
        console.log(`   Text length: ${textFittingResults.textLength} characters`);
        console.log(`   Is overflowing: ${textFittingResults.isOverflowing}`);

        if (textFittingResults.isOverflowing) {
            console.log('⚠️  Warning: Text is still overflowing!');
        } else {
            console.log('✅ Text fitting successful - no overflow detected');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
        console.log('🔒 Browser closed');
    }
}

// Run the test
testTwitterTextFitting(); 