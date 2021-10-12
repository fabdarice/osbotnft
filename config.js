const { OpenSeaPort, Network } = require('opensea-js');
const HDWalletProvider = require("hdproxy-w3");
const { ethers } = require('ethers');

const config = require('./config.json');

const expiration = Math.round(Date.now() / 1000 + 60 * 60 * config.expirationHours)
const network = config.network == "rinkeby" ? Network.Rinkeby : Network.Main
const tokenIds = Array.from({length:config.tokenIdEnd-config.tokenIdStart+1},(v,k)=>config.tokenIdStart+k)
const provider = new HDWalletProvider({
      privateKeys: [config.privateKey],
      providerOrUrl: config.rpcUri
  });

const seaport = new OpenSeaPort(provider, {
  networkName: network
})
const wallet = new ethers.Wallet(config.privateKey)

module.exports = {
  config,
  expiration,
  network,
  tokenIds,
  provider,
  seaport,
  wallet,
}
