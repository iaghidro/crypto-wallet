# CRYPTO WALLET

A NodeJS crypto currency wallet SDK currently supporting Bitcoin, Ethereum, and ERC20 Tokens


# Wallet management

## Wallet/ Address creation

 Get Balance 

    npm run balance 'COIN_SYMBOL'
    npm run balance GNT

 Generate Wallet Files

    npm run generateWalletFiles WALLET_TYPE WALLET_ID NUMBER_OF_ACCOUNTS'
 
 1) This will create files in the following directory for ethereum:

 /root/.ethereum/keystore/
 
 2) This will create files in the following directory for bitcoin:

 /root/.electrum/wallets/

 Create Ether wallet. Generates accounts/addresses based on number of accounts given

    npm run generateWalletFiles ETH eth_alt4 'myFakePass' 50 

 Create bitcoin wallet (must save seed manually to metadata.json after creation for now):

    npm run generateWalletFiles BTC eth_alt4 'myFakePass'

## Consolidating Coins 

 Send coins from each address to a destination address.

    npm run consolidateCoins 'DESTINATION_ADDRESS' 'COIN_SYMBOL' 'MIN_CONSOLIDATE_AMOUNT' 'CUSTOM_MINER_FEE

 Consolidate Bitcoin

 For bitcoin there is no need for min consolidate amount, electrum handles consolidation.

    npm run consolidateCoins 'MY_BITCOIN_ADDRESS' BTC 0 '0.001'

 Consolidate Ether
    consolidate to a specific address:
    npm run consolidateCoins 'MY_ETHER_ADDRESS' 'ETH' '0.02' '0.005'

    use defaults:
    npm run consolidateEther;

 Consolidate Ether Token

 For tokens there is no need for miner fee since the miner fee is paid in ether.

    npm run consolidateCoins 'MY_ETHER_ADDRESS' 'GNT' '0' '0' 
    
## Disperse Coins

 Send coins to all addresses.
    
    npm run disperseCoins 'AMOUNT_TO_DISPERSE' 'COIN_SYMBOL'

 Disperse Ether
    npm run disperseCoins '0.012' ETH

    use defaults:
    npm run disperseEther;

## Sending Coins

    npm run sendCoins 'ADDRESS' 'AMOUNT_TO_SEND' 'COIN_SYMBOL' 'CUSTOM_MINER_FEE'

 Send Ether

    npm run sendCoins 'MY_ETHER_ADDRESS' '1.818' ETH '0.003'
 
 Send Ether Token

 For tokens there is no need for miner fee since the miner fee is paid in ether.

    npm run sendCoins 'MY_ETHER_ADDRESS' '6.56654615' GNT '0'
 
 Send Bitcoins

    npm run sendCoins 'MY_BITCOIN_ADDRESS' '0.976'  BTC '0.0008'


# On-board new coin

1) add to lib/config.coins

   if its an ether token find contract address here: (https://etherscan.io/tokens) 

2) add to lib/config.pairs

3) add pair to /config.trader.coinCominationCodes

4) add to /config.tradePair

5) add to wallet creation to lib/wallet/Wallet.createWallet


# Running Tests:

1) run tests

    npm test

2) grep for tests

    npm run testGrep 'MyClass'


# Retire a wallet:

1) create new wallet

2) send all coins to a new address in wallet

3) move address to retired directory

4) save password and seed
