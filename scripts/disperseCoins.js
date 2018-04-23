var Wallet              = require('./../lib/wallet/Wallet');

const disperseAmount    = process.argv[2]; //first param
const coin              = process.argv[3]; 

var disperseCoins = function () {
    console.log(`@@@@@@@@@ SCRIPTS::disperseCoins::START disperseAmount: ${disperseAmount} @@@@@@@@@`);
    const wallet = new Wallet.createWallet({coin: coin});
    wallet.disperseCoins(disperseAmount)
            .then(() => {
                console.log(`@@@@@@@@@ SCRIPTS::disperseCoins Completed Successfully! @@@@@@@@@`);
            })
            .catch((err) => {
                console.log(`@@@@@@@@@ SCRIPTS::disperseCoins Failed To disperse coins@@@@@@@@@`);
                console.dir(err);
            });

};

disperseCoins();
