const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    // set up browser and tab
    const browser = await chromium.launch()
    .then((browser) => {
        writeToLog('opening browser');
        return browser;
    });
    const browserContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await browserContext.newPage();
    await page.setDefaultTimeout(10000);

    let gpuBought = 0;      // # of GPUs bought (lim = 6)
    while (gpuBought < 6) {
        fs.appendFile('log.txt', '-------------------------------------------------------------------------------------------------\n', function (err) {});

        await page.goto("https://www.bestbuy.ca/en-ca/collection/rtx-30-series-graphic-cards/316108?path=category%253AComputers%2B%2526%2BTablets%253Bcategory%253APC%2BComponents%253Bcategory%253AGraphics%2BCards", { timeout: 30000 });
        await page.click('text=NVIDIA GeForce RTX 3060 Ti 8GB GDDR6 Video Card', { timeout: 30000 });
        // await page.goto("https://www.bestbuy.ca/en-ca/product/sony-wh-1000xm4-over-ear-noise-cancelling-bluetooth-headphones-black/14777258", { timeout: 30000 }).catch(err => console.log(err));
        await page.waitForSelector(':nth-match(:text("Add to Cart"), 1)', { timeout : 120000 })
        .then(() => {
            writeToLog('waitng for page to load "Add to Cart button"');
        })
        .catch(err => console.log(err));

        let gpuIsInStock = await (await page.$(':nth-match(:text("Add to Cart"), 1)')).isEnabled();
        if (gpuIsInStock) {
            writeToLog('GPU is in stock');
            await page.click(':nth-match(:text("Add to Cart"), 1)')
            .then(() => {
                writeToLog('adding 1 GPU to cart');
            })
            .catch(err => console.log(err));
            await page.waitForSelector('text=Go to Cart').catch(err => console.log(err));
            await page.click('text=Go to Cart')
            .then(() => {
                writeToLog('go to cart');
            })
            .catch(err => console.log(err));
            await delay(6000);  // wait for cart page to complete load
            await page.$eval('text=Continue to Checkout', (element) => element.click())
            .then(() => {
                writeToLog('proceed to checkout');
            })
            .catch(err => console.log(err));
            // await delay(100000);  // wait for checkout page to complete load
            await page.screenshot({ path: `cur-frame.png` });
            
            break; // delete later

            gpuBought++;

        } else {
            writeToLog('GPU is NOT in stock');
        }
    }
    
    // close browser
    await browser.close()
    .then(() => {
        fs.appendFileSync('log.txt', '-------------------------------------------------------------------------------------------------\n');
        writeToLog('closing browser');
    });
})();

// log workflow
function writeToLog(msg) {
    fs.appendFile('log.txt', `${(new Date()).toLocaleString()}: ${msg}\n`, function (err) {
        console.error(err);
    });
}

// set delay in code execution
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
}