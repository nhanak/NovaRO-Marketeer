# NovaRO-Marketeer
NovaRO CLI to analyze market data and find deals

## Setup

### Selenium dependency

This project uses Selenium to scrape the market data. You will need to download
the correct chromedriver.exe (found at
https://sites.google.com/a/chromium.org/chromedriver/downloads) and put it on
your PATH.

### Node

This project uses Node. You can download Node here: https://nodejs.org/en/

### NPM

Run the following in your terminal to install Selenium

```
yarn install
```

## Usage

1. Run the following in your terminal

```
node app.js
```

2. Enter NovaRO credentials in the browser that opens and solve their captcha (the captcha will be more difficult, as the captcha is aware you are using an automated browser).

3. Once you are signed in, the browser will scrape the NovaRO Market and recommend deals to you in your terminal

4. Profit

