
var app                     = require('./../');
var Wallet                  = app.Wallet;

const destinationAddress    = process.argv[2]; //first param
const coin                  = process.argv[3]; 
const minConsolidateAmount  = process.argv[4]; 
const customMinerFee        = process.argv[5]; 

var consolidateCoins = function () {
    console.log(`@@@@@@@@@ SCRIPTS:: Starting consolidate coins @@@@@@@@@ destinationAddress: ${destinationAddress} 
        coin: ${coin} minConsolidateAmount: ${minConsolidateAmount} customMinerFee: ${customMinerFee}`);
    const wallet = new Wallet.createWallet({coin: coin});
    wallet.init()
            .then(() => consolidateCoins(destinationAddress, minConsolidateAmount, customMinerFee))
            .then((result) => {
                console.log(`@@@@@@@@@ SCRIPTS::consolidateCoins Completed Successfully! @@@@@@@@@`);
                console.dir(result);
            })
            .catch((err) => {
                console.log(`@@@@@@@@@ SCRIPTS::consolidateCoins Failed To Consolidate coins @@@@@@@@@`);
                console.dir(err);
            });

};

consolidateCoins();
