const prompt = require('prompt-sync')();
const {
  FgYellow,
  FgBlack,
  FgCyan,
  FgRed,
  Reset,
  FgGreen,
} = require('./colors.js');

const {
  config,
  seaport,
} = require('../config.js')

function addZeroX(str) {
  if (str.startsWith("0x")) {
    return str
  }
  if (!str) {
    return ""
  }
  return `0x${str}`
}

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

async function getFloorPrice() {
  const asset = await seaport.api.getAsset({
    tokenId: config.tokenIdStart,
    tokenAddress: config.tokenAddress, // string
  })

  const floor = asset['collection']['stats']['floor_price']
  return floor
}

function userConfirmation() {
  const confirm = prompt('Confirm? (Y/N)  ');
  if (confirm.toLowerCase() != 'y') {
    process.exit(0)
  }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function printSingle(label, value) {
  console.log(`${label}:`, FgCyan, value, Reset)
}

function printTitle(label) {
  console.log(FgYellow, '****************************************************', Reset)
  console.log(FgYellow, `*************** ${label} ***************`, Reset)
  console.log(FgYellow, '****************************************************', Reset)
}

function printError(err) {
  console.error(FgRed, err, Reset)
}

function printSuccess(msg) {
  console.log(FgGreen, msg, Reset)
}

module.exports = {
  addZeroX,
  delay,
  getFloorPrice,
  numberWithCommas,
  userConfirmation,
  printSingle,
  printTitle,
  printError,
  printSuccess
}
