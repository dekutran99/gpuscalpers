const GPU = 'evga3060ti';

const playwright = require('playwright');
const fs = require('fs');

(async () => {
    // set up browser and tab
    const browser = await playwright.firefox.launch({ slowMo: 100 })
    .then((browser) => {
        writeToLog('opening browser');
        return browser;
    });
    const browserContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await browserContext.newPage();
    await page.setDefaultTimeout(10000);

    // go to item page
    let isPageLoaded = false;
    while (!isPageLoaded) {
        try {
            let response = await page.goto('https://www.bestbuy.ca/en-ca/product/evga-nvidia-geforce-rtx-3060-ti-ftw3-ultra-8gb-gddr6-video-card/15229237', { timeout: 30000 });
            if (response.status() !== 404) {
                isPageLoaded = true;
            }
        } catch (err) {
            try {
                await page.goto('https://www.bestbuy.ca/en-ca/collection/rtx-30-series-graphic-cards/316108?path=category%253AComputers%2B%2526%2BTablets%253Bcategory%253APC%2BComponents%253Bcategory%253AGraphics%2BCards%253Bcustom0graphicscardmodel%253AGeForce%2BRTX%2B3060%2BTi', { timeout: 30000 });
                await page.click('text=EVGA NVIDIA GeForce RTX 3060 Ti FTW3 Ultra 8GB GDDR6 Video Card', { timeout: 30000 });
                isPageLoaded = true;
            } catch (err) {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            }
            console.error(err);
            writeToLog(`an error occured\n ${err}`);
        }
    }

    let isGPUBought = false;
    while (!isGPUBought) {
        fs.appendFile(`${GPU}.txt`, '-------------------------------------------------------------------------------------------------\n', function (err) {});
        
        // check if item is in stock using "Add to Cart" button as indicator
        await page.waitForSelector(':nth-match(:text("Add to Cart"), 1)', { timeout : 120000 })
        .catch(err => {
            console.error(err);
            writeToLog(`an error occured\n ${err}`);
        });
        let gpuIsInStock = await (await page.$(':nth-match(:text("Add to Cart"), 1)')).isEnabled()
        .then(bool => {
            writeToLog('checking if item is in stock');
            return bool;
        })
        .catch(err => {
            console.error(err);
            writeToLog(`an error occured\n ${err}`);
        });
        if (gpuIsInStock) {
            writeToLog('GPU is in stock');
            
            // adding item to cart
            await page.click(':nth-match(:text("Add to Cart"), 1)')
            .then(() => {
                writeToLog('adding 1 GPU to cart');
            })
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });

            // go to cart
            await page.click('text=Go to Cart', { timeout: 30000 })
            .then(() => {
                writeToLog('going to cart page');
            })
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });
            await page.click('xpath=//*[@id="root"]/div/div[4]/div[2]/div[2]/section/div/main/section/section[2]/div[2]/div')
            .then(() => {
                writeToLog('proceeding to checkout');
            })
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });

            // sign in
            await page.fill('[id="username"]', process.env.BB_UN)
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });
            await page.fill('[id="password"]', process.env.BB_PW)
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });
            await page.click('[type="submit"]')
            .then(() => {
                writeToLog('signing in');
            })
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });
            
            // place order
            await page.fill('[id="cvv"]', process.env.BB_PAYMENT_CVV, { timeout: 30000 })
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });
            await page.click('xpath=//*[@id="posElement"]/section/section[1]/button')
            .then(() => {
                writeToLog('placing order');
            })
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });
            await delay(30000);
            
            // screenshot confirmation page
            await page.screenshot({ path: `${GPU}.png` })
            .then(() => {
                writeToLog('confirmation page');
            })
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });

            isGPUBought = true;

        } else {
            writeToLog('GPU is NOT in stock');
            await page.goBack();
            await page.goForward();
        }
    }
    
    // close browser
    await browser.close()
    .then(() => {
        fs.appendFileSync(`${GPU}.txt`, '-------------------------------------------------------------------------------------------------\n');
        writeToLog('closing browser');
    });
})();

// log workflow
function writeToLog(msg) {
    fs.appendFile(`${GPU}.txt`, `${(new Date()).toLocaleString()}: ${msg}\n`, function (err) {
        console.error(err);
    });
}

// set delay in code execution
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
}