const {Builder, By, until} = require('selenium-webdriver')
const {toInt} = require('./utils/parser')

const items = [
  {
    name: 'Black Jitterbug Tooth',
    id: '32567',
  },
  {name: 'Enriched Elunium', id: '7619'},
  {name: 'Enriched Oridecon', id: '7620'},
]

;(async function run() {
  let driver = await new Builder().forBrowser('chrome').build()
  try {
    // Sign into NovaRO
    await driver.get(
      'https://www.novaragnarok.com/?module=account&action=login&return_url=%2F%3Fmodule%3Dvending',
    )

    const novaROMarketeerLogo =
      '--------------------\n|    N O V A R O    |\n| M A R K E T E E R |\n--------------------'
    console.log(novaROMarketeerLogo)
    console.log('\nYou have 240 seconds to complete the captchas and sign in!')
    await driver.wait(until.elementLocated(By.id('search-input')), 240000)
    console.log('Succesfully signed into NovaRO')

    // Get all recommendations
    const recommendations = []
    for (let i = 0; i < items.length; i++) {
      const recommendation = await getRecommendation(driver, items[i])
      recommendations.push(recommendation)
    }

    // Output recommendations to console
    console.log('\nPURCHASE RECOMMENDATIONS')
    console.log('Name | Buy | Sell | Profit')
    recommendations.forEach(recommendation => {
      printRecommendation(recommendation)
    })
  } catch (err) {
    console.log('Ran into an error in run():')
    console.log(err)
  } finally {
    console.log('\nGoodbye!')
    await driver.quit()
  }
})()

// getRecommendation({name, id}): advise user to purchase or not purchase an item
async function getRecommendation(driver, {name, id}) {
  try {
    console.log(`\tGetting reccomendation for: ${name}`)
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
    console.log('Ran into an error in getRecommendation():')
    console.log(err)
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
  console.log(`averWeekInt - currentMinInt = ${averWeekInt} - ${currentMinInt}`)
  console.log(`stdDeviationWeekInt ${stdDeviationWeekInt}`)
  const purchase = currentMinInt < averWeekInt - stdDeviationWeek * 0.9
  const ppu = averWeekInt - currentMinInt
  //if (purchase) {
  console.log(`${name} | ${currentMin} | ${averageWeek} | ${ppu}z`)
  //}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
