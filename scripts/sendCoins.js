var app = require('./../');
var Wallet = app.Wallet;
var Slack = app.Slack;

var sendCoins = function (toAddress, amount, coin, customMinerFee) {
    if (!coin){
        console.error('***** MISSING COIN ');
        return;
    }
    var wallet = new Wallet.createWallet({coin: coin});
    
    if(Boolean(customMinerFee)){
        console.log(`Has custom miner fee ${customMinerFee}`);
        var parsedMinerFee = parseFloat(customMinerFee);
        if(!isNaN(parseFloat(parsedMinerFee))){
            console.log(`Has valid custom miner fee of: ${parsedMinerFee}`);
            wallet.minerFee = parsedMinerFee;
        }
    }
    
    wallet.init()
            .then(() => wallet.sendCoins(toAddress, amount))
            .then((result) => {
                console.log(`@@@@@@@@@ Completed successfully! @@@@@@@@@`);
                console.dir(result);
            })
            .catch((err) => {
                console.log(`@@@@@@@@@ Failed@@@@@@@@@`);
                console.dir(err);
            });
};

const toAddress             = process.argv[2]; //first param
const amount                = process.argv[3]; //second param
const coin                  = process.argv[4]; 
const customMinerFee        = process.argv[5]; 

sendCoins(toAddress, amount, coin, customMinerFee);