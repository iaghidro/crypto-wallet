var async               = require('async');
var Logger              = require('./../logger/Logger');

class CoinDisperser {

    constructor(params) {
        this.log                    = (params && params.log) || Logger.create();
        this.wallet                 = params.wallet;
        this.disperseAmount         = parseFloat(params.disperseAmount);
        this.log.info(`CoinDisperser::constructor disperseAmount: ${this.disperseAmount}`);
        if (!this.disperseAmount || ! this.wallet) {
            throw Error(`CoinDisperser::constructor:: Invalid params`);
        }
    }

    disperseCoins() {
        this.log.info(`CoinDisperser::disperseCoins`);
        return this.wallet.init()
                .then(() => this._disperseAllAmounts());
    }
    
    _disperseAllAmounts() {
        const addressLength = (this.wallet.addresses) ? this.wallet.addresses.length : 0;
        this.log.info(`CoinDisperser::_disperseAllAmounts addressLength: ${addressLength}`);

        return new Promise((resolve, reject) => {
            async.eachSeries(this.wallet.addresses, (address, eachCallback) => {
                this.wallet.getAddressBalance(address.addressString)
                        .then((balance) => this._handleAddress(address, balance))
                        .then(() => eachCallback())
                        .catch((err) => eachCallback(err));
            }, (err) => {
                if (err) {
                    this.log.error(`CoinDisperser::_disperseAllAmounts Failed to finish dispersing amounts`);
                    return reject(err);
                }
                this.log.info(`CoinDisperser:: Successfully finished dispersing amounts`);
                resolve();
            });
        });

    }

    _handleAddress(address, balance) {
        this.log.info(`CoinDisperser::_handleAddress::Address: ${address.addressString} balance: ${balance} disperseAmount: ${this.disperseAmount}`);
        
        const shouldSendCoins = parseFloat(balance) < this.disperseAmount;
        if (shouldSendCoins) {
            this.log.info(`@@@@@ CoinDisperser:: shouldSendCoins: ${shouldSendCoins}`);
            return this.wallet.sendCoins(address.addressString, this.disperseAmount);
        }
        return Promise.resolve();
    }

}

module.exports = CoinDisperser;
