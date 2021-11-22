const { ethers } = require('ethers');

const {
  config,
  expiration,
  network,
  tokenIds,
  provider,
  seaport,
  wallet
} = require('./config.js')

const {
  userConfirmation,
  delay,
  getFloorPrice,
  printSingle,
  printTitle,
  printError
} = require('./utils/utils.js');

async function main() {
  const floor = config.floor || await getFloorPrice()
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


// async function getAssets() {
//   const assets = await seaport.api.getAssets({
//     asset_contract_address: config.tokenAddress,
//     order_direction: "asc",
//     offset: 0,
//     order_by: "pk",
//     limit: 2,
//   })
//   return assets
// }


async function massBids() {
  console.log("Start mass bidings..")
  const assets = []
  for (const tokenId of tokenIds) {
    assets.push({tokenId, tokenAddress: config.tokenAddress, schemaName: config.schemaName})
  }

  for (const asset of assets) {
    try {
      await delay(320000)
      await singleBid(seaport, asset)
    } catch(err) {
      // console.log(err)
      // console.log('waiting 80 secs..')
      // await delay(120000)
      await singleBid(seaport, asset)
    }
  }
}

async function singleBid(seaport, asset) {
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

function printConfig(floor) {
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
