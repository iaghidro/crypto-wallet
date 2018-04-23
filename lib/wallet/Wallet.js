const async             = require('async');
const _                 = require('lodash');
var createFile          = require('create-file');
var util                = require('./../util');
var Logger              = require('./../logger/Logger');
var CoinConsolidator    = require('./CoinConsolidator');
var CoinDisperser       = require('./CoinDisperser');
var Address             = require('./Address');
var coins               = require('../../config').coins;

class Wallet {

    constructor(params = {}) {
        this.log                    = params.log ? params.log : Logger.create();
        this.type                   = this.constructor.name;
        this.coin                   = params.coin;
        this.coinConfig             = coins[this.coin];
        this.minerFee               = this.coinConfig.minerFee;
        this.walletId               = params.walletId || process.env.WALLET_ID; // remove hard coded proccess env
        this.password               = params.password;
        this.seed                   = params.seed;
        this.addresses              = [];
        this.setAmount(0);

        this.generateWalletPath(this.walletId);

        this.metadataPath           = `${this.walletPath}/metadata.json`;
        this.log.info(`Wallet::${this.type}::constructor coin: ${this.coin}, minerFee: ${this.minerFee}, walletId: ${this.walletId}, metadataPath: ${this.metadataPath}`);
    }

    init() {
        this.log.info(`Wallet::${this.type}::init`);
        this.setPassword();
        return this.validate()
                .then(() => this.updateAddresses())
                .then(() => this.updateAmount())
//                .then(() => this.updateAggregates()) // total balance, highest amount, ect
                .catch((err) => {
                    this.log.error(`Wallet::${this.type}::init failed to init`);
                    //todo: add ignoreFailure param
                    return Promise.reject(err);
                });
    }

    validate() {
        this.log.info(`Wallet::${this.type}::validate coin: ${this.coin}, minerFee: ${this.minerFee},
                        walletId: ${this.walletId}, metadataPath: ${this.metadataPath}`);
        if(!this.coin
                || isNaN(this.minerFee)
                || !this.walletId
                || !this.metadataPath
                || !this.password) {
            this.log.error(`Wallet::${this.type}::validate Invalid wallet params`);
            return Promise.reject(`Invalid wallet params`);
        }
        return Promise.resolve();
    }

    setPassword() {
        this.log.info(`Wallet::${this.type}::setPassword`);
        if(!this.password){
            var walletMetadata          = require(this.metadataPath);
            this.password               = walletMetadata.password;
        }
        if(!this.seed){
            var walletMetadata          = require(this.metadataPath);
            this.seed                   = walletMetadata.seed;
        }
    }

    ////////////////////////////
    ///////  ADDRESSES  ////////
    ////////////////////////////

    getRandomAddress() {
        this.log.info(`Wallet::${this.type}::getRandomAddress getting random address`);
        var index = this.getRandomAddressIndex();
        var address = this.addresses[index];
        this.log.info(`Wallet::${this.type}::getRandomAddress address: ${address}`);
        return address.addressString;
    }

    getRandomAddressIndex() {
        var fromInclusive = 0;
        var toExclusive = this.addresses.length;
        var index = util.getRandomInt(fromInclusive, toExclusive);
        this.log.info(`Wallet::${this.type}::getRandomAddressIndex index: ${index} size: ${toExclusive}`);
        return index;
    }

    updateAddresses() {
        this.log.info(`Wallet::${this.type}::updateAddresses`);
        return this.getAddressStrings()
                .then((addressStrings) => this.createAddresses(addressStrings))
                .then(() => this.updateAddressBalances());
    }

    createAddresses(addressStrings) {
        this.log.info(`Wallet::${this.type}::createAddresses`);
        addressStrings.forEach((addressString, index) => {
           this.addAddress(addressString, index);
        });
    }

    updateAddressBalances() {
        this.log.info(`Wallet::${this.type}::updateAddressBalances`);
        return new Promise((resolve, reject) => {
            async.eachOf(this.addresses, (address, index, eachCallback) => {
                this.getAddressBalance(address.addressString)
                        .then((balance) => address.setBalance(balance))
                        .then(() => eachCallback())
                        .catch((err) => {
                            this.log.error(`Wallet::${this.type}::updateAddressBalances failed to get balance for address: ${address.addressString}`);
                            this.log.error(err);
                            eachCallback();
                        });
            }, (err) => {
                if (err) {
                    this.log.error(`Wallet::${this.type}::updateAddressBalances Failed to finish getting addresses`);
                    return reject(err);
                }
                this.log.info(`Wallet::${this.type}::updateAddressBalances Successfully retrieved address balances`);
                resolve();
            });
        });
    }

    addAddress(addressString, index, balance) {
        const address = new Address({
            addressString,
            index,
            balance,
            log: this.log
        });
        this.addresses.push(address);
    }

    ////////////////////////////
    ////////  BALANCE  /////////
    ////////////////////////////

    validateAmount(amount) {
        if (isNaN(amount)) {
            return Promise.reject(`Invalid amount: ${amount}`);
        }
        return Promise.resolve(amount);
    }

    /**
     * Available amount. Most cases the total balance.
     * In Ethereum case it's the highest address balance.
     * @returns {Float}
     */
    getWalletAmount() {
        this.log.info(`Wallet::${this.type}::getWalletAmount:: amount: ${this.amount}`);
        return this.amount;
    }

    getHighestAmountAddress() {
        const highestAmountAddress = _.chain(this.addresses)
                .orderBy("balance")
                .last()
                .value();
        if(Boolean(highestAmountAddress)){
            this.log.info(`Wallet::${this.type}::getHighestAmountAddress highestAmountAddress: ${highestAmountAddress.addressString}, balance: ${highestAmountAddress.balance}`);
        }
        return highestAmountAddress;
    }

    calculateBalance() {
        const balance = _.chain(this.addresses)
                .sumBy("balance")
                .round(3)
                .value();
        this.log.info(`Wallet::${this.type}::calculateBalance balance: ${balance}`);
        return balance;
    }

    updateAmount() {
        this.log.info(`Wallet::${this.type}::updateAmount`);
        return this.getAmount()
                .then((amount) => this.setAmount(amount));
    }

    setAmount(amount) {
        this.log.info(`Wallet::${this.type}::setAmount`);
        this.amount = parseFloat(amount);
    }

    ////////////////////////////
    //////  MANAGEMENT  ////////
    ////////////////////////////

    consolidateCoins(destinationAddress, minConsolidateAmount, customMinerFee) {
        this.log.info(`Wallet::${this.type}::consolidateCoins destinationAddress: ${destinationAddress},
            minConsolidateAmount: ${minConsolidateAmount}, customMinerFee: ${customMinerFee}`);
        if (util.isSimulation()){
            this.log.warn(`Wallet::${this.type}::consolidateCoins SIMULATION MODE, skipping consolidation`);
            return Promise.resolve();
        }
        this.coinConsolidator = new CoinConsolidator({
            wallet              : this,
            destinationAddress  : destinationAddress || this.getRandomAddress(), //todo: get highest amount address
            customMinerFee      : customMinerFee,
            minConsolidateAmount: minConsolidateAmount
        });
        return this.coinConsolidator.consolidateCoins();
    }

    disperseCoins(disperseAmount) {
        this.log.info(`Wallet::${this.type}::disperseCoins disperseAmount: ${disperseAmount}`);
        if (util.isSimulation()){
            this.log.warn(`Wallet::${this.type}::disperseCoins SIMULATION MODE, skipping disperse`);
            return Promise.resolve();
        }
        this.coinDisperser = new CoinDisperser({
            wallet              : this,
            disperseAmount      : disperseAmount
        });
        return this.coinDisperser.disperseCoins();
    }

    generateWalletPath(walletName) {
        this.log.info(`Wallet::${this.type}::generateWalletPath walletType: ${this.coin} walletName: ${walletName}`);
        if(!this.coinConfig.name || !walletName) {
            throw Error(`Wallet::${this.type}::generateWalletPath INVALID PARAMS coinName: ${this.coinConfig.name} walletName: ${walletName}`);
        }
        this.walletPath = `/app/wallets/${this.coinConfig.walletBasePath}/${walletName}`;
        this.log.info(`Wallet::${this.type}::generateWalletPath path: ${this.walletPath}`);
    }

    saveMetadata() {
        this.log.info(`Wallet::${this.type}::saveMetadata ${this.metadataPath}`);
        const metadata = {};
        this.password ? metadata.password = this.password : null;
        this.seed ? metadata.seed = this.seed : null;
        const metadataString = JSON.stringify(metadata);
        return new Promise((resolve, reject) => {
            createFile(this.metadataPath, metadataString, function (err) {
                // file either already exists or is now created (including non existing directories)
                if(err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }

}

Wallet.createEthereum = function (params) {
    var Ethereum = require('./../ethereum/Ethereum');
    return new Ethereum(params);
};

Wallet.createContract = function (params) {
    var Contract = require('./../ethereum/Contract');
    return new Contract(params);
};

Wallet.createElectrum = function (params) {
    var Electrum = require('./../electrum/Electrum');
    return new Electrum(params);
};

Wallet.createIOTA = function (params) {
    var IOTA = require('./../iota/IOTA');
    return new IOTA(params);
};

Wallet.createWallet = function (params) {
    //TODO: add these to arrays
    // todo add wallet id from process.env.WALLET_ID
    const coinSymbol = params.coin ? params.coin.toUpperCase() : '';
    switch (coinSymbol) {
        case coins.BTC.symbol:
            return Wallet.createElectrum(params);
            break;
        case coins.ETH.symbol:
            return Wallet.createEthereum(params);
            break;
        case coins.IOT.symbol:
            return Wallet.createIOTA(params);
            break;
        case coins.GNT.symbol:
        case coins.REP.symbol:
        case coins.EOS.symbol:
        case coins["1ST"].symbol:
        case coins.BAT.symbol:
        case coins.GNO.symbol:
        case coins.ANT.symbol:
        case coins.BNT.symbol:
        case coins.SNT.symbol:
        case coins.ZRX.symbol:
        case coins.EDG.symbol:
        case coins.RLC.symbol:
            return Wallet.createContract(params);
            break;
        default:
            throw new Error(`Wallet::${this.type}::createWallet::${this.type}:: Invalid coin: ${params.coin}`);
    }
};

module.exports = Wallet;
