
var app                     = require('./../');
var Wallet                  = app.Wallet;

const coin                  = process.argv[2]; //first param

var getBalance = function () {
    console.log(`@@@@@@@@@ SCRIPTS::getBalance Starting @@@@@@@@@ coin: ${coin}`);
    const wallet = new Wallet.createWallet({coin: coin});
    wallet.init()
            .then(() => {
                console.log(`@@@@@@@@@ SCRIPTS::getBalance Completed Successfully! @@@@@@@@@`);
                console.log(`Total balance: ${wallet.calculateBalance()}`);
            })
            .catch((err) => {
                console.log(`@@@@@@@@@ SCRIPTS::getBalance Failed @@@@@@@@@`);
                console.dir(err);
            });

};

getBalance();
