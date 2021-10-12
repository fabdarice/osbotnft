## Requirements

Install all dependencies:
```shell
npm install
```

Fill in all information in `config.json`:
```shell
cp config.json.template config.json

{
    "network": "<NETWORK>",     // "mainnet" || "rinkeby"
    "rpcUri": "<NODE_URI>",     // Node RPC URI (ex: Infura, Alchemy, .)
    "privateKey": "<WALLET_PRIVATE_KEY>",
    "tokenAddress": "<NFT_TOKEN_ADDRESS>",
    "expirationHours": <EXPIRATION_IN_HOURS>,
    "schemaName": "ERC721",
    "tokenIdStart": <TOKEN_ID_START>,
    "tokenIdEnd": <TOKEND_ID_END>,
    "bidAmount": <BID_AMOUNT_IN_ETH> 
}
```


## Mass bids
```shell
node mass_biding.js
```
