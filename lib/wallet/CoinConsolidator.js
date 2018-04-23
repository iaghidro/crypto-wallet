var async           = require('async');
var Big             = require('big.js');
var Logger          = require('./../logger/Logger');

class CoinConsolidator {

    constructor(params = {}) {
        this.log                    = params.log || Logger.create();
        this.wallet                 = params.wallet;
        this.destinationAddress     = params.destinationAddress;
        this.minConsolidateAmount   = params.minConsolidateAmount;
        if(Boolean(params.customMinerFee)){
            this.wallet.minerFee = params.customMinerFee;
        }
        this.log.info(`CoinConsolidator::constructor destinationAddress: ${this.destinationAddress}  
                    minerFee: ${this.wallet.minerFee} minConsolidateAmount: ${this.minConsolidateAmount}`);
    }

    consolidateCoins() {
        this.log.info(`CoinConsolidator::consolidateCoins`);
        return this.validate()
                .then(() => this._determineMinConsolidateAmount())
                .then(() => this._sendAllAmountsToDestination());
    }

    validate() {
        if (isNaN(this.wallet.minerFee)) {
            return Promise.reject(`CoinConsolidator::validate Invalid wallet miner fee minerFee: ${this.wallet.minerFee}`);
        }
        if (!this.destinationAddress) {
            return Promise.reject(`CoinConsolidator::validate No destination address`);
        }
        if(!this.wallet.addresses){
            //todo: could init wallet here
            return Promise.reject('CoinConsolidator::validate No addresses available for wallet');
        }
        return Promise.resolve();
    }

    _determineMinConsolidateAmount() {
        this.log.info(`CoinConsolidator::_determineMinConsolidateAmount::`);
        if(isNaN(this.minConsolidateAmount)) {
            this.log.warn(`CoinConsolidator::_determineMinConsolidateAmount:: 
            minConsolidateAmount is invalid: ${this.minConsolidateAmount}, using wallet miner fee minerFee: ${this.wallet.minerFee}`);
            this.minConsolidateAmount = parseFloat(this.wallet.minerFee);
        }
        this.minConsolidateAmount = parseFloat(this.minConsolidateAmount);
        this.log.info(`CoinConsolidator::_determineMinConsolidateAmount:: using minConsolidateAmount: ${this.minConsolidateAmount}`);
    }

    _sendAllAmountsToDestination() {
        this.log.info(`CoinConsolidator::_sendAllAmountsToDestination`);
        return new Promise((resolve, reject) => {
            async.eachSeries(this.wallet.addresses, (address, eachCallback) => {
                this.wallet.getAddressBalance(address.addressString)
                        .then((balance) => this._handleAddress(address, balance))
                        .then(() => eachCallback())
                        .catch((err) => eachCallback(err));
            }, (err) => {
                if (err) {
                    this.log.error(`CoinConsolidator::_sendAllAmountsToDestination Failed to finish consolidating amounts`);
                    return reject(err);
                }
                this.log.info(`CoinConsolidator:: Successfully finished consolidating amounts`);
                resolve();
            });
        });

    }

    _handleAddress(address, balance) {
        var availableAmount = this._calculateAvailableAmount(balance);
        var validBalanceForTransaction = availableAmount > 0;
        const addressIsDestinationAddress = address.addressString === this.destinationAddress;
        this.log.info(`CoinConsolidator::_handleAddress::Address: ${address.addressString} balance: ${balance}, addressIsDestinationAddress: ${addressIsDestinationAddress}`);
        if (validBalanceForTransaction && !addressIsDestinationAddress) {
            this.log.info(`@@@@@ CoinConsolidator:: Valid balance: ${balance} availableAmount: ${availableAmount}`);
            return this.wallet.sendCoins(this.destinationAddress, availableAmount, address.addressString);
        }
        return Promise.resolve();
    }
    
    _calculateAvailableAmount(balance) {
        var balanceBig = Big(balance);
        var minConsolidateAmountBig = Big(this.minConsolidateAmount);
        var calculatedAmountBig = balanceBig.minus(minConsolidateAmountBig);
        return parseFloat(calculatedAmountBig);
    }

}

module.exports = CoinConsolidator;
