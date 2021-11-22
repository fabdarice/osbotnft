const { OrderSide } = require('opensea-js/lib/types');
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


const MAX_TOKEN_IDS_PER_REQUEST = 30

async function main() {
  const floor = config.floor || await getFloorPrice()

  const floorBN = ethers.utils.parseEther(floor.toString())
  const floorTarget = floorBN.div(3)
  printConfig(floor, floorTarget)
  userConfirmation()

  let tokenIdsRequest = []

  while (true) {
    const secondsSinceEpoch = Math.round(Date.now() / 1000)
    try {
      for (var i = 0, j = tokenIds.length; i < j; i += MAX_TOKEN_IDS_PER_REQUEST) {
        tokenIdsRequest = tokenIds.slice(i, i + MAX_TOKEN_IDS_PER_REQUEST)
        await delay(1000)
        const assetsBelowPrice = await snipeBelowFloor(floorTarget, tokenIdsRequest, secondsSinceEpoch)
        console.log(`Scanning from #${tokenIdsRequest[0]} to #${tokenIdsRequest[MAX_TOKEN_IDS_PER_REQUEST - 1]}`)
      }
    } catch(err) {
      console.log(err)
      await delay(12000)
      continue
    }
  }
}

async function snipeBelowFloor(floorTarget, tokenIds, secondsSinceEpoch) {
  const { orders, count } = await seaport.api.getOrders({
    asset_contract_address: config.tokenAddress,
    token_ids: tokenIds,
    side: OrderSide.Sell,
    limit: 30,
    order_by: 'eth_price',
    order_direction: 'asc',
    sale_kind: 0,
    bundled:false,
    include_bundled:false,
    include_invalid:false,
    listed_after: secondsSinceEpoch,
  })

  if (count >= 3) {
    printError('3 sniping opportunities.. fishy..')
    process.exit(1)
  }

  for (const order of orders) {
    const curPrice = order['currentPrice']
    if (curPrice.lt(floorTarget)) {
      printSuccess('**********************************************************')
      printSuccess('***************** LOWBALL LISTING DETECTED ***************')
      printSuccess('**********************************************************')
      printSingle('Price (ETH)', ethers.utils.formatEther(curPrice.toString()))
      printSingle('TokenID', order['asset']['tokenId'])
      // await acceptOrder(order)
    }
  }
}

async function acceptOrder(order) {
  const txHash = await seaport.fulfillOrder({ order, accountAddress: wallet.address })
  console.log('Executing OS purchasing order:', txHash)
}


function printConfig(floor, floorTarget) {
  console.log('--------------- [Global Config] ---------------')
  printSingle('Network', network)
  printSingle('Node URI', config.rpcUri)
  printSingle('Wallet', wallet.address)
  console.log('--------------- [NFT Config] ---------------')
  printSingle('Token Addresss', config.tokenAddress)
  printSingle('Token Id Start', config.tokenIdStart)
  printSingle('Token Id End', config.tokenIdEnd)
  printSingle('Schema', config.schemaName)
  console.log('--------------- [NFT Floor] ---------------')
  printSingle('Floor (ETH)', floor)
  printSingle('Floor Target (ETH)', ethers.utils.formatEther(floorTarget))
  console.log('-----------------------------------------------')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

