const {Builder, By, until} = require('selenium-webdriver')
const {toInt} = require('./utils/parser.js')
const {sleep} = require('./utils/sleep')
const fs = require('fs')
var inquirer = require('inquirer')
const LOGIN_URL =
  'https://www.novaragnarok.com/?module=account&action=login&return_url=%2F%3Fmodule%3Dvending'

const WELCOME_STRING =
  '--------------------\n|    N O V A R O    |\n| M A R K E T E E R |\n--------------------\n'

const TABLE_PAD = 22

const MARKET_CUT = 0.03

;(async function run() {
  console.log(WELCOME_STRING)
  const openBrowserSession = await promptUserToOpenBrowserSession()
  if (openBrowserSession) {
    const driver = await getDriver()
    try {
      await login(driver)
      let shouldScrapeItems = await promptUserToScrapeItems()
      while (shouldScrapeItems) {
        const items = getItems()
        const scrapedItems = await scrapeItems(driver, items)
        printRecommendations(scrapedItems)
        shouldScrapeItems = await promptUserToScrapeItems()
      }
    } catch (err) {
      console.log(err)
    } finally {
      await driver.quit()
    }
  }
  console.log('\nThanks for using NovaRO Marketeer!\n')
})()

async function promptUserToOpenBrowserSession() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'openBrowserSession',
        message: 'Open new browser session for scraping?',
        default: true,
      },
    ])
    return answers.openBrowserSession
  } catch (error) {
    if (error.isTtyError) {
      console.log('Render error error: ')
      console.log(error)
    } else {
      console.log('Horrible error:')
      console.log(error)
    }
  }
}

async function promptUserToScrapeItems() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'scrapeItems',
        message: 'Scrape items?',
        default: true,
      },
    ])
    return answers.scrapeItems
  } catch (error) {
    if (error.isTtyError) {
      console.log('Render error error')
      throw error
    } else {
      console.log('Horrible error')
      throw error
    }
  }
}

function getItems() {
  return JSON.parse(fs.readFileSync('./data/items.json'))
}

async function getDriver() {
  return await new Builder().forBrowser('chrome').build()
}

async function login(driver) {
  await driver.get(LOGIN_URL)
  console.log('\nYou have 240 seconds to complete the captchas and sign in!')
  await driver.wait(until.elementLocated(By.id('search-input')), 240000)
  console.log('Succesfully signed into NovaRO\n')
}

function printRecommendations(scrapedItems) {
  console.log('\nPurchase Recommendations')
  console.log(
    `\t${'Name'.padEnd(TABLE_PAD + 15)} | ${'Buy'.padEnd(
      TABLE_PAD,
    )} | ${'Sell'.padEnd(TABLE_PAD)} | Profit`,
  )
  console.log(
    `\t${'-'.padEnd(TABLE_PAD + 16, '-')}|${'-'.padEnd(
      TABLE_PAD + 2,
      '-',
    )}|${'-'.padEnd(TABLE_PAD + 2, '-')}|${'-'.padEnd(10, '-')}`,
  )
  scrapedItems.forEach(item => {
    printRecommendation(item)
  })
  console.log('\n')
}

// NAME | BUY | SELL | PROFIT PER UNIT
function printRecommendation({
  name,
  averageWeek,
  currentMin,
  stdDeviationWeek,
}) {
  const currentMinInt = toInt(currentMin)
  const averWeekInt = toInt(averageWeek)
  const stdDeviationWeekInt = toInt(stdDeviationWeek)
  const ppu = Math.floor(averWeekInt - currentMinInt - averWeekInt * MARKET_CUT)
  const purchase =
    currentMinInt < averWeekInt - stdDeviationWeekInt * 0.9 && ppu > 0

  if (purchase) {
    console.log(
      `\t${name.padEnd(TABLE_PAD + 15)} | ${currentMin.padEnd(
        TABLE_PAD,
      )} | ${averageWeek.padEnd(TABLE_PAD)} | ${ppu}z`,
    )
  }
}

async function scrapeItems(driver, items) {
  console.log('\nScraping items:')
  const scrapedItems = []
  for (let i = 0; i < items.length; i++) {
    const scrapedItem = await scrapeItem(driver, items[i])
    scrapedItems.push(scrapedItem)
  }
  return scrapedItems
}

async function scrapeItem(driver, {name, id}) {
  try {
    console.log(`\t${name}`)
    await driver.get(
      `https://www.novaragnarok.com/?module=vending&action=item&id=${id}`,
    )
    await sleep(2000)
    await driver.wait(until.elementLocated(By.id('market-item-name')), 5000)
    const soldAmtWeek = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[1]/td[2]`))
      .getText()
    const soldAmtMonth = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[2]/td[2]`))
      .getText()
    const minWeek = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[1]/td[3]`))
      .getText()
    const minMonth = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[2]/td[3]`))
      .getText()
    const maxWeek = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[1]/td[4]`))
      .getText()
    const maxMonth = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[2]/td[4]`))
      .getText()
    const averageWeek = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[1]/td[5]`))
      .getText()
    const averageMonth = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[2]/td[5]`))
      .getText()
    const stdDeviationWeek = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[1]/td[6]`))
      .getText()
    const stdDeviationMonth = await driver
      .findElement(By.xpath(`//*[@id="nova-table-stats"]/tbody/tr[2]/td[6]`))
      .getText()
    const currentMin = await driver
      .findElement(By.xpath(`//*[@id="itemtable"]/tbody/tr/td[1]`))
      .getText()
    return {
      name,
      id,
      soldAmtMonth,
      soldAmtWeek,
      minWeek,
      minMonth,
      maxWeek,
      maxMonth,
      averageWeek,
      averageMonth,
      stdDeviationWeek,
      stdDeviationMonth,
      currentMin,
    }
  } catch (err) {
    console.log(`Ran into an error scraping item: ${name}`)
    return {
      name,
      id,
      soldAmtMonth: '0',
      soldAmtWeek: '0',
      minWeek: '0',
      minMonth: '0',
      maxWeek: '0',
      maxMonth: '0',
      averageWeek: '0',
      averageMonth: '0',
      stdDeviationWeek: '0',
      stdDeviationMonth: '0',
      currentMin: '0',
    }
  }
}
