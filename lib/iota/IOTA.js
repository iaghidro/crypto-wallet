const iotaLib = require('iota.lib.js');
const randomstring = require('randomstring');
const Wallet = require('./../wallet/Wallet');

class IOTA extends Wallet {

    constructor(params) {
        super(params);
        super.setPassword(); // In IOTA's case its the seed
        this.createInstance();
    }

    init() {
        this.log.info(`IOTA::init`);
//        return super.init();
    }
    
//    todo: will need to override this, use lib to generate next unused address
    getRandomAddress() {
        this.log.info(`IOTA::getRandomAddress getting next unused address`);
    }
    
    // could save and read from file
    getAddressStrings() {
        this.log.info(`IOTA::getAddressStrings`);
        const options = {
            total: 5 // todo: move to config
        };
        return new Promise((resolve, reject) => {
            this.iota.api.getNewAddress(this.seed, options, (error, response) => {
                if (error) {
                    this.log.info(`IOTA::getAddressStrings error`);
                    reject(error);
                } else {
                    this.log.info(`IOTA::getAddressStrings success`);
                    resolve(response);
                }
            });
        });
    }

    getAmount() {
        this.log.info(`IOTA::getAmount`);
          const options = {
//            start: 0,
//            end: 0,
//            threshold: 0,
        };
        return new Promise((resolve, reject) => {
            this.iota.api.getInputs(this.seed, options, (error, response) => {
                if (error) {
                    this.log.info(`IOTA::getAmount error`);
                    reject(error);
                } else {
                    this.log.info(`IOTA::getAmount success`);
                    resolve(response.totalBalance);
                }
            });
        });
    }

    getAddressBalance(address) {
        this.log.info(`IOTA::getAddressBalance address: ${address}`);
    }

    sendCoins(toAddress, amount) {
        this.log.info(`IOTA::sendCoins:: address:${toAddress} amount: ${amount}`);
        // https://learn.iota.org/tutorial/payments-and-messaging-leaderboard
        return this.prepareTransfers()                          // bundle generation
                .then(() => this.getTransactionsToApprove())    // tip selection
                .then(() => this.proofOfWOrk());                // proof of work
    }

    generateWalletFiles(walletId) {
        this.log.info(`IOTA::generateWalletFiles walletName: ${walletId}`);
        if (!walletId) {
            return Promise.reject(`IOTA::generateWalletFiles INVALID PARAMS walletId: ${walletId}`);
        }
        return Promise.resolve()
                .then(() => this.generateSeed())
                .then(() => super.generateWalletPath(walletId))
                .then(() => super.saveMetadata());
    }

    /////////////////////////////////
    ///////// IOTA SPECIFIC /////////
    /////////////////////////////////

    createInstance() {
        // Create IOTA instance with host and port as provider
        //todo: move params into config
        this.iota = new iotaLib({
            'host': 'http://iota.bitfinex.com', // load balanced IOTA server wallet
            'port': 80,
//            sandbox: true,
//            validate: function
        });
    }

    getNodeInfo() {
        return new Promise((resolve, reject) => {
            this.iota.api.getNodeInfo((error, response) => {
                if (error) {
                    this.log.info(`IOTA::getNodeInfo error`);
                    reject(error);
                } else {
                    this.log.info(`IOTA::getNodeInfo success`);
                    resolve(response);
                }
            });
        });
    }

    generateSeed() {
        // todo: move to config
        const length = 81;
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
        this.seed = randomstring.generate({
            length: length,
            charset: charset
        });
        this.log.info(`IOTA::generateSeed:: seed: ${this.seed}`);
    }

}

module.exports = IOTA;