var app                     = require('./../');
var Wallet                  = app.Wallet;
var Logger                  = app.Logger;

var consolidateEther = function () {
    console.log(`@@@@@@@@@ SCRIPTS:: Starting consolidateEther @@@@@@@@@ `);
    const minConsolidateAmount = 0.04;
    const customMinerFee = 0.007;
    const logId = `${process.env.WALLET_ID}_consolidateEther` ;
    const log = Logger.create(logId);
    const etherWallet = new Wallet.createWallet({coin: "ETH",log});
    etherWallet.initWalletAccess();
    if(etherWallet.isSyncing()){
        console.log(`@@@@@@@@@ SCRIPTS::consolidateEther Skipping consolidate because of sync! @@@@@@@@@`);
        return;
    }
    etherWallet.init()
            .then(() => etherWallet.getFundingAddress())
            .then((destinationAddress) => etherWallet.consolidateCoins(destinationAddress, minConsolidateAmount, customMinerFee))
            .then((result) => {
                console.log(`@@@@@@@@@ SCRIPTS::consolidateEther Completed Successfully! @@@@@@@@@`);
                console.dir(result);
            })
            .catch((err) => {
                console.log(`@@@@@@@@@ SCRIPTS::consolidateEther Failed To Consolidate coins @@@@@@@@@`);
                console.dir(err);
            });

};

consolidateEther();
