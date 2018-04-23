const Web3              = require('web3');
const Big               = require('big.js');
const async             = require('async');
const util              = require('./../util');
const Logger            = require('./../logger/Logger');
const AccountGenerator  = require('./../wallet/AccountGenerator');
const Wallet            = require('./../wallet/Wallet');
const ethereumConfig    = require('./config');

class Ethereum extends Wallet {

    constructor(params = {}) {
        super(params);
        this.log.info(`Ethereum::constructor`);
        
        this.web3                       = new Ethereum.dependencies.Web3();
        this.unlockAccountInSeconds     = this.web3.toHex(ethereumConfig.unlockAccountInSeconds);
        this.addressDelayMultiple       = ethereumConfig.addressDelayMultiple;
        this.jsonRPCTimeout             = ethereumConfig.jsonRPCTimeout;
        this.jsonRPCPort                = ethereumConfig.jsonRPCPort;
        this.blockNumbers               = ethereumConfig.blockNumbers;
        this.syncDelay                  = ethereumConfig.syncDelay;
    }
    
    init() {
        this.log.info(`Ethereum::init`);
        return this.handleRestart()
//                .then(() => this.handleSync())
                .then(() => super.init());
    }

    getAddressStrings() {
        this.log.info(`Ethereum::getAddressStrings`);
        var addresses = this.getAddresses();
        return Promise.resolve(addresses);
    }
    
    
//    todo: refactor this and remove getAddresses function
//    getAddressStrings() {
//        this.log.info(`Ethereum::getAddressStrings`);
//        let addressStrings = this.web3.eth.accounts;
//        addressStrings = addressStrings || [];
//        return Promise.resolve(addressStrings);
//    }

    getAddressBalance(address) {
//        this.log.info(`Ethereum::getAddressBalance`);
        if (!Boolean(address) || typeof address !== 'string') {
            this.log.error(`Ethereum::getAddressBalance:: Invalid address: ${address}`);
            return Promise.resolve(0);
        }
        
        return new Promise((resolve, reject) => {
            this.web3.eth.getBalance(address, this.blockNumbers.latest, (err, balance) => {
                if(err){
                    return reject (err);
                }
               resolve(this.convertFromWei(balance)); 
            }); 
        });
        
    }

    getAmount() {
        this.log.info(`Ethereum::getAmount`);
        const highestAmountAddress = super.getHighestAmountAddress();
        const highestBalance = highestAmountAddress ? highestAmountAddress.balance : 0;
        return super.validateAmount(highestBalance);
    }

    sendCoins(toAddress, amount, fromAddress) {
        this.log.info(`Ethereum::sendCoins:: address:${toAddress} amount: ${amount}`);
        return this.createTransaction(toAddress, amount, fromAddress)
                .then((transaction) => this.unlockAccount(transaction))
                .then((transaction) => this.signTransaction(transaction))
                .then((signedTransaction) => this.broadcastTransaction(signedTransaction));
    }
    
    /**
     * 
     * Generates wallet files in the wallet type directory under root/wallets/{WALLET_TYPE}/{WALLET_ID}.
     * Assigns password given.
     * 
     * @param {String} walletId
     * @param {Integer} accountsToCreate
     * @returns {Promise}
     */
    generateWalletFiles(walletId, accountsToCreate) {
        this.log.info(`Ethereum::generateWalletFiles walletName: ${walletId} accountCount: ${accountsToCreate}`);
        if(!walletId || !this.password) {
            return Promise.reject(`Ethereum::generateWalletFiles INVALID PARAMS walletId: ${walletId} password: ${this.password}`);
        }
        var accountGenerator = new AccountGenerator({
            accountsToCreate    : accountsToCreate,
            password            : this.password,
            wallet              : this
        });
        return Promise.resolve()
                .then(() => super.generateWalletPath(walletId))
                .then(() => super.saveMetadata())
                .then(() => accountGenerator.generateAccounts());
    }
    
    /////////////////////////////////
    /////////ETHEREUM SPECIFIC///////
    /////////////////////////////////

    handleRestart() {
        this.log.info(`Ethereum::handleRestart`);
        let hasError = false;
        try {
            this.initWalletAccess();
        } catch (error) {
            hasError = true;
//            this.log.error(error);
        }
        if (hasError) {
            this.log.warn(`Ethereum::handleRestart has error`);
//            Ethereum.restart({log: this.log});
//            return util.delay(this.syncDelay)
//                    .then(() => this.handleRestart());
        }
        return Promise.resolve();
    } 
    
    handleSync() {
        if(this.isSyncing()){
            return util.delay(this.syncDelay)
                    .then(() => this.log.info(`Ethereum::handleSync attempting re initializing`))
                    .then(() => this.handleSync());
        }
        return Promise.resolve();
    }
    
    initWalletAccess() {
        this.log.info(`Ethereum::startEthereum`);
        var provider = new Ethereum.dependencies.Web3.providers.HttpProvider(this.jsonRPCPort, this.jsonRPCTimeout);
        this.web3.setProvider(provider);
        this.logBlockChainSyncStatus();
    }

    logBlockChainSyncStatus() {
        var sync = this.web3.eth.syncing;
        this.log.info("Ether sync status");
        this.log.info(sync);
    }
    
    isSyncing() {
        this.log.info(`Ethereum::isSyncing`);
        this.logBlockChainSyncStatus();
        return Boolean(this.web3.eth.syncing);
    }

    createNewAddress(password) {
        this.log.info(`Ethereum::createNewAddress`);
        if (!password) {
            return Promise.reject('Ethereum::createNewAddress:: Missing password');
        }
        this.log.info(`Ethereum::createNewAddress`);
        return new Promise((resolve, reject) => {
            this.web3.personal.newAccount(password, (err, response) => {
                if (err) {
                    this.log.error(err);
                    return reject(err);
                }
                resolve(response);
            });
        });
    }

    getFundingAddress() {
        this.log.info(`Ethereum::getFundingAddress`);
        return super.init()
                .then(() => Promise.resolve(super.getHighestAmountAddress().addressString));
    }
    
    getAddresses() {
        this.log.info(`Ethereum::getAddresses`);
        var accounts = this.web3.eth.accounts;
        var accountsExist = Boolean(accounts);
        return accountsExist ? accounts : [];
    }
    
    createTransaction(toAddress, amount, fromAddress) {
        if (Boolean(fromAddress)) {
            return this.createTransactionObject(toAddress, fromAddress, amount);
        }
        return this.getFundingAddress()
                    .then((fundingAddress) => this.createTransactionObject(toAddress, fundingAddress, amount));
    }

    createTransactionObject(toAddress, fromAddress, amount) {
        const gas = new Big(50000);  //todo move to config
        const gasPrice = this.web3.eth.gasPrice; //todo: put a multiple
        const value = this.web3.toWei(amount, "ether");
        this.log.info(`Ethereum::createTransactionObject gas: ${gas}, gasPrice: ${gasPrice}, amount: ${amount}, convertedAmount ${value}`);
        var transaction = {
            from: fromAddress, 
            to: toAddress,
            gas,
//            gasPrice,
            value
        };
        return Promise.resolve(transaction);
    }

    //TODO: implement this
    signTransaction(transaction) {
        this.log.info(`Ethereum::signTransaction`);
        console.log(transaction)
        return Promise.resolve(transaction);
    }

    broadcastTransaction(signedTransaction) {
        this.log.info(`Ethereum::broadcastTransaction`);
        return new Promise((resolve, reject) => {
            this.web3.eth.sendTransaction(signedTransaction, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }
    
//todo: clean this up so transaction is nor passed through
    unlockAccount(transaction) {
        var address = transaction.from;
        this.log.info(`Ethereum::unlockAccount:: address: ${transaction.from}`);
        return new Promise((resolve, reject) => {
            this.web3.personal.unlockAccount(address, this.password, this.unlockAccountInSeconds, function (err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(transaction);
            });
        });
    }

    convertFromWei(amount) {
        var etherBalance = this.web3.fromWei(amount, "ether").toString(10);
        return parseFloat(etherBalance);
    }

}

Ethereum.dependencies   = {
    Web3: Web3
};

Ethereum.schemas        = require('./Schemas');
Ethereum.restart        = require('./restartEthereum');

module.exports = Ethereum;



//    //TODO: integrate this
//    transferEntireBalance(from, to) {
//        var gas = new BigNumber(21000);
//        var price = web3.eth.gasPrice;  // current average price; or set your own
//        var balance = eth.getBalance(from);
//        var value = balance.minus(gas.times(price));
//        if (value.greaterThan(0)) {
//            var txn = eth.sendTransaction({from: from, to: to, gasPrice: price, gas: gas, value: value});
//            console.log("  Transfer", from, "to", to, ":", txn);
//            return txn;
//        }
//        console.log("  Transfer " + from + " to " + to + ": (No funds available)");
//        return null;
//    }
