const { OpenSeaPort, Network } = require('opensea-js');
const HDWalletProvider = require("hdproxy-w3");
const { ethers } = require('ethers');

const config = require('./config.json');

const {
  userConfirmation,
  printSingle,
  printTitle
} = require('./utils/utils.js');

const expiration = Math.round(Date.now() / 1000 + 60 * 60 * config.expirationHours)
const network = config.network == "rinkeby" ? Network.Rinkeby : Network.Main
const tokenIds = Array.from({length:config.tokenIdEnd-config.tokenIdStart+1},(v,k)=>config.tokenIdStart+k)
var provider = new HDWalletProvider({
      privateKeys: [config.privateKey],
      providerOrUrl: config.rpcUri
  });

const seaport = new OpenSeaPort(provider, {
  networkName: network
})


async function main() {
  const floor = await getFloorPrice()
  printConfig(floor)
  safetyCheck(floor)
  userConfirmation()

  await massBids()
}

function safetyCheck(floor) {
  if (config.bidAmount > (floor * 0.66)) {
    printError(`bidAmount (${config.bidAmount}) > 2/3 floor (${floor})`)
    process.exit(1)
  }
}

async function getFloorPrice() {
  const asset = await seaport.api.getAsset({
    tokenId: config.tokenIdStart,
    tokenAddress: config.tokenAddress, // string
  })

  const floor = asset['collection']['stats']['floor_price']
  return floor
}


async function massBids() {
  const assets = []
  for (const tokenId of tokenIds) {
    assets.push({tokenId, tokenAddress: config.tokenAddress, schemaName: config.schemaName})
  }
  const wallet = new ethers.Wallet(config.privateKey)

  for (const asset of assets) {
    const bid = await seaport.createBuyOrder({
      asset,
      accountAddress: wallet.address,
      // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
      startAmount: config.bidAmount,
      // Optional expiration time for the order, in Unix time (seconds):
      expirationTime: expiration,
    })
    console.log(`Successfully bid ${config.bidAmount} ETH on #${asset['tokenId']}`)
  }
}


function printConfig(floor) {
  const wallet = new ethers.Wallet(config.privateKey)

  console.log('--------------- [Global Config] ---------------')
  printSingle('Network', network)
  printSingle('Node URI', config.rpcUri)
  printSingle('Wallet', wallet.address)
  console.log('--------------- [NFT Config] ---------------')
  printSingle('Token Addresss', config.tokenAddress)
  printSingle('Token Id Start', config.tokenIdStart)
  printSingle('Token Id End', config.tokenIdEnd)
  printSingle('Expiration (Hours)', config.expirationHours)
  printSingle('Schema', config.schemaName)
  console.log('--------------- [NFT Floor] ---------------')
  printSingle('Bid Amount (ETH)', config.bidAmount)
  printSingle('Floor (ETH)', floor)
  console.log('-----------------------------------------------')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
