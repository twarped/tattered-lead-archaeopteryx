import { launch } from 'puppeteer';
import { unlink } from "node:fs/promises";
import { configDotenv } from 'dotenv';

configDotenv();

const browser = await launch({
    headless: true
});

let page = await browser.newPage();

await page.setViewport({
    width: 640,
    height: 480,
    deviceScaleFactor: 1,
})

await page.goto('https://youtube.com/account/', {
    waitUntil: 'networkidle2',
});
console.log('logging in...');

await page.locator('#identifierId').fill(process.env.email);
await page.locator('#identifierNext').click();
console.log('email entered.');
await page.waitForNavigation();
await page.locator('#password').fill(process.env.password);
await page.locator('#passwordNext').click();
console.log('password entered.');

const headers = (await page.waitForNavigation()).request().headers();
headers.cookie = await page.evaluate('document.cookie');

await unlink('headers.json');
Bun.file('headers.json').writer().write(JSON.stringify(headers));
console.log('logged in.');
postMessage('logged in.');