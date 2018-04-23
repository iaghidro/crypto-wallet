
var app                 = require('./../');
var Wallet              = app.Wallet;

const walletType        = process.argv[2]; //first param
const walletId          = process.argv[3]; //second param
const password          = process.argv[4];
const numberOfAccounts  = process.argv[5];

var generateWalletFiles = function () {
    
    console.log(`@@@@@@@@@ walletType: ${walletType} walletId: ${walletId} password: ${password} numberOfAccounts: ${numberOfAccounts} @@@@@@@@@`);
    
    if(!walletType || !walletId) {
        console.error(`@@@@@@@@@ INVALID PARAMS walletType: ${walletType} @@@@@@@@@`);
        return ;
    }

    Wallet.createWallet({coin: walletType, walletId: walletId, password: password})
            .generateWalletFiles(walletId, numberOfAccounts)
            .then(() => {
                console.log(`@@@@@@@@@ Completed Creating wallet Successfully! @@@@@@@@@`);
                console.log(`@@@@@@@@@ walletType: ${walletType} walletId: ${walletId} password: ${password} numberOfAccounts: ${numberOfAccounts} @@@@@@@@@`);
            })
            .catch((err) => {
                console.log(`@@@@@@@@@ Failed To create wallet @@@@@@@@@`);
                console.log(`@@@@@@@@@ walletType: ${walletType} walletId: ${walletId} password: ${password} numberOfAccounts: ${numberOfAccounts} @@@@@@@@@`);
                console.dir(err);
            });
            
};

generateWalletFiles();
