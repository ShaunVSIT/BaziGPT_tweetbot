const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testShareCard() {
    console.log('🧪 Testing share card formatting...');

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

        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport for consistent rendering
        await page.setViewport({
            width: 1200,
            height: 630,
            deviceScaleFactor: 2
        });

        // Enable Chinese font loading
        await page.evaluateOnNewDocument(() => {
            // Force font loading for Chinese characters
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap';
            document.head.appendChild(link);

            // Set fallback font for Chinese characters
            document.body.style.fontFamily = '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
        });

        // Navigate to the share card URL
        await page.goto('https://bazigpt.io/api/daily-share-card-png', {
            waitUntil: 'load',
            timeout: 30000
        });

        // Wait for rendering
        await page.waitForTimeout(3000);

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
        const filename = `share-card-${timestamp}.png`;
        const filepath = path.join(outputDir, filename);

        console.log('📸 Taking screenshot...');
        await page.screenshot({
            path: filepath,
            type: 'png',
            fullPage: false
        });

        console.log(`✅ Screenshot saved to: ${filepath}`);

        // Also save the HTML for inspection
        const htmlContent = await page.content();
        const htmlFilename = `share-card-${timestamp}.html`;
        const htmlFilepath = path.join(outputDir, htmlFilename);
        fs.writeFileSync(htmlFilepath, htmlContent);
        console.log(`📄 HTML saved to: ${htmlFilepath}`);

        // Get page title and dimensions
        const title = await page.title();
        const dimensions = await page.evaluate(() => ({
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight
        }));

        console.log('📊 Page info:');
        console.log(`   Title: ${title}`);
        console.log(`   Dimensions: ${dimensions.width}x${dimensions.height}`);
        console.log(`   Viewport: 1200x630 (2x scale)`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
        console.log('🔒 Browser closed');
    }
}

// Run the test
testShareCard(); 