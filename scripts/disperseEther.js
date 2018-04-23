
var Wallet              = require('./../lib/wallet/Wallet');
var Logger              = require('./../lib/logger/Logger');

var disperseEther = function () {
    console.log(`@@@@@@@@@ SCRIPTS::disperseEther::START @@@@@@@@@`);
    const disperseAmount = 0.025;
    const logId = `${process.env.WALLET_ID}_disperseEther` ;
    const log = Logger.create(logId);
    const etherWallet = new Wallet.createWallet({coin: "ETH",log});
    etherWallet.initWalletAccess();
    if(etherWallet.isSyncing()){
        console.log(`@@@@@@@@@ SCRIPTS::consolidateEther Skipping disperse because of sync! @@@@@@@@@`);
        return;
    }
    etherWallet.disperseCoins(disperseAmount)
            .then(() => {
                console.log(`@@@@@@@@@ SCRIPTS::disperseEther Completed Successfully! @@@@@@@@@`);
            })
            .catch((err) => {
                console.log(`@@@@@@@@@ SCRIPTS::disperseEther Failed To disperse coins@@@@@@@@@`);
                console.dir(err);
            });

};

disperseEther();
