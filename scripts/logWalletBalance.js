
var app = require('./../');
var Wallet = app.Wallet;
var slack = new app.Slack();

const coin = process.argv[2]; //first param

var logWalletBalance = function () {
    console.log(`@@@@@@@@@ SCRIPTS::logWalletBalance Starting @@@@@@@@@ coin: ${coin}`);
    const wallet = new Wallet.createWallet({coin: coin});
    if(wallet.initWalletAccess){
        wallet.initWalletAccess();
    }
    if(Boolean(wallet.isSyncing) && wallet.isSyncing()){
        console.log(`@@@@@@@@@ SCRIPTS::logWalletBalance Skipping consolidate because of sync! @@@@@@@@@`);
        return;
    }
    wallet.init()
            .then(() => {
                console.log(`@@@@@@@@@ SCRIPTS::logWalletBalance Completed Successfully! @@@@@@@@@`);
                const balance = wallet.calculateBalance();
                const balanceLog = `${process.env.WALLET_ID}: ${coin} ${balance}`;
                slack.postMessage(app.Slack.CHANNELS.WALLET_BALANCE, balanceLog);
            })
            .catch((err) => {
                console.log(`@@@@@@@@@ SCRIPTS::logWalletBalance Failed @@@@@@@@@`);
                console.dir(err);
            });

};

logWalletBalance();
