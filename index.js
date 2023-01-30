import fs from 'fs';
import open from 'open';
import puppeteer from 'puppeteer';
import {startFlow} from 'lighthouse/lighthouse-core/fraggle-rock/api.js';

async function captureReport() {
    //Locators
    const locatorTablesCategory = 'a[href="/category/tables"]';
    const locatorTableProduct = 'a[href="/product/white-table"]';
    const locatorAddBasketButton = '.pro-details-cart';
    const locatorBasketIcon = 'button[class="icon-cart"]';
    const locatorAddedToBasketPopup = '.shopping-cart-content.active';
    const locatorProceedToCheckoutButton = 'a[href="/checkout"]';

    const browser = await puppeteer.launch({"headless": false, defaultViewport: null, /*args: ['--start-maximized']*/});
    const BASE_URL = 'http://localhost:8083/';
    const page = await browser.newPage();
    await page.setDefaultTimeout(10000);

    const flow = await startFlow(page, {
        name: 'demoblaze',
        configContext: {
            settingsOverrides: {
                throttling: {
                    rttMs: 40,
                    throughputKbps: 10240,
                    cpuSlowdownMultiplier: 1,
                    requestLatencyMs: 0,
                    downloadThroughputKbps: 0,
                    uploadThroughputKbps: 0
                },
                throttlingMethod: "simulate",
                screenEmulation: {
                    mobile: false,
                    width: 1600,
                    height: 1000,
                    deviceScaleFactor: 1,
                    disabled: false,
                },
                formFactor: "desktop",
                onlyCategories: ['performance'],
            },
        },
    });

    //Open home page
    await flow.navigate(BASE_URL, {stepName: 'open main page'});
    await page.goto(BASE_URL, {'waitUntil': 'domcontentloaded'});
    console.log('Home page is loaded');

    // Navigate to "Tables"
    await flow.startTimespan({stepName: 'Navigate to Tables'});
    const tablesCategory = await page.waitForSelector(locatorTablesCategory, {visible: true});
    await tablesCategory.click();
    console.log('Navigated to "Tables"');
    await flow.endTimespan();

    // Open a table product cart (click on a table)
    await flow.startTimespan({stepName: 'Open a table product cart'})
    const tableName = await page.waitForSelector(locatorTableProduct, {visible: true});
    await tableName.click();
    await flow.endTimespan();

    // Add table to Cart (click "Add to Cart" button)
    await flow.startTimespan({stepName: 'Add table to Cart'});
    const addToBasketButton = await page.waitForSelector(locatorAddBasketButton, {visible: true});
    await addToBasketButton.click();
    await flow.endTimespan();

    // Open Cart
    await flow.startTimespan({stepName: 'Open Cart'});
    await page.waitForNetworkIdle();
    const basketIcon = await page.waitForSelector(locatorBasketIcon, {visible: true});
    await basketIcon.focus();
    await basketIcon.click();
    await page.waitForSelector(locatorAddedToBasketPopup, {visible: true});
    await flow.endTimespan();

    // Click "Proceed to checkout"
    await flow.startTimespan({stepName: 'Navigate to Proceed to Checkout'});
    const proceedToCheckoutBtn = await page.waitForSelector(locatorProceedToCheckoutButton, {visible: true});
    await proceedToCheckoutBtn.click();
    await flow.endTimespan();

    //Close the browser
    await browser.close();

    //Generate Lighthouse report
    const report = await flow.generateReport();
    fs.writeFileSync('flow.report.html', report);
    open('flow.report.html', {wait: false});
}

captureReport();

