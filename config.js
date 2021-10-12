const { OpenSeaPort, Network } = require('opensea-js');
const HDWalletProvider = require("hdproxy-w3");
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
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


// var proxies = [];
// const data = fs.readFileSync('proxies.txt', 'utf8');
// data.split('\n').forEach(line => {
//     if (line.length > 3){ proxies.push(`http://${line}`); }
// });
// console.log(`Loaded ${proxies.length} proxies`)

// const fetch = global.fetch;
// global.fetch = function() {
//     var url = arguments[0];
//     var options = arguments[1];

//       var proxy = proxies.shift();
//       proxies.push(proxy);
//       arguments[1].agent = new HttpsProxyAgent(proxy);
//       console.log(proxy)

//     return new Promise((resolve, reject) => {
//         fetch.apply(this, arguments)
//         .then((response) => {
//             resolve(response);
//         })
//         .catch((error) => {
//             reject(error);
//         })
//     });
// }


module.exports = {
  config,
  expiration,
  network,
  tokenIds,
  provider,
  seaport,
  wallet,
}
