const playwright = require('playwright');
const fs = require('fs');

(async () => {
    // set up browser and tab
    const browser = await playwright.firefox.launch()
    .then((browser) => {
        writeToLog('opening browser');
        return browser;
    });
    const browserContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await browserContext.newPage();
    await page.setDefaultTimeout(10000);

    try {
        await page.goto("https://www.bestbuy.ca/en-ca/collection/rtx-30-series-graphic-cards/316108?path=category%253AComputers%2B%2526%2BTablets%253Bcategory%253APC%2BComponents%253Bcategory%253AGraphics%2BCards%253Bcustom0graphicscardmodel%253AGeForce%2BRTX%2B3060%2BTi", { timeout: 30000 });
        await page.click('text=NVIDIA GeForce RTX 3060 Ti 8GB GDDR6 Video Card', { timeout: 30000 });
    } catch (err) {
        console.error(err);
        writeToLog(`an error occured\n ${err}`);
        continue;
    }
    let isGPUBought = false;
    while (!isGPUBought) {
        fs.appendFile('log.txt', '-------------------------------------------------------------------------------------------------\n', function (err) {});

        await page.goto('https://www.bestbuy.ca/en-ca/product/logitech-logitech-hd-webcam-c270-960-000621/10146689', { waitUntil: 'load', timeout: 30000 });
        await page.waitForSelector(':nth-match(:text("Add to Cart"), 1)', { timeout : 120000 })
        .then(() => {
            writeToLog('waitng for page to load Add to Cart button');
        })
        .catch(err => {
            console.error(err);
            writeToLog(`an error occured\n ${err}`);
        });

        let gpuIsInStock = await (await page.$(':nth-match(:text("Add to Cart"), 1)')).isEnabled();
        if (gpuIsInStock) {
            writeToLog('GPU is in stock');
        
            await page.click(':nth-match(:text("Add to Cart"), 1)')
            .then(() => {
                writeToLog('adding 1 GPU to cart');
            })
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });
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
            .catch(er => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });
            
            // place order
            await page.fill('[id="cvv"]', "123", { timeout: 30000 })
            .catch(err => {
                console.error(err);
                writeToLog(`an error occured\n ${err}`);
            });
            // await page.click('xpath=//*[@id="posElement"]/section/section[1]/button')
            // .then(() => {
            //     writeToLog('placing order');
            // })
            // .catch(err => {
            //     console.error(err);
            //     writeToLog(`an error occured\n ${err}`);
            // });
            // await delay(30000);
            
            await page.screenshot({ path: `cur-frame.png` })
            .then(() => {
                writeToLog('order placed');
            })
            .catch(err => {});

            isGPUBought = true;

        } else {
            writeToLog('GPU is NOT in stock');
            await page.reload({ waitUntil: 'load' });
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