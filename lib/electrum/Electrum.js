var exec            = require('child-process-promise').exec;
var Wallet          = require('./../wallet/Wallet');
var Schemas         = require('./Schemas');

class Electrum extends Wallet {

    constructor(params) {
        super(params);
    }

    init() {
        this.log.info(`Electrum::init`);
        return super.init();
    }

    getAddressStrings() {
        this.log.info(`Electrum::getAddressStrings`);
        var cmd = `electrum listaddresses --receiving`;
        return Electrum.api(cmd)
                .then((result) => this.parseCommandResponse(result));
    }

    getAmount() {
        this.log.info(`Electrum::getAmount`);
        var cmd = `electrum getbalance`;
        return Electrum.api(cmd)
                .then((result) => this.parseCommandResponse(result))
                .then((result) => this.parseBalance(result));
    }
    
    getAddressBalance(address) {
        this.log.info(`Electrum::getAddressBalance address: ${address}`);
        var cmd = `electrum getaddressbalance ${address}`;
        return Electrum.api(cmd)
                .then((result) => this.parseCommandResponse(result))
                .then((result) => this.parseBalance(result));
    }

    sendCoins(toAddress, amount) {
        this.log.info(`Electrum::sendCoins:: address:${toAddress} amount: ${amount}`);
        return this.createTransaction(toAddress, amount)
                .then((transactionHex) => this.signTransaction(transactionHex))
                .then((signedTransactionHex) => this.broadcastTransaction(signedTransactionHex));
    }
      
    updateAddresses() {
        this.log.info(`Electrum::updateAddresses`);
        return this.getAddressData()
                .then((addressData) => this.createAddressesFromData(addressData));
    }

    //TODO: validate input (amount could be ! if sending all coins)
    //TODO: set fee level config instead of setting fee here
    createTransaction(toAddress, amount) {
        this.log.info(`Electrum::createTransaction:: address:${toAddress} amount: ${amount} minerFee: ${this.minerFee}`);
        var cmd = `electrum payto ${toAddress} ${amount} -W '${this.password}' -f '${this.minerFee}'`;
        return Electrum.api(cmd)
                .then((result) => this.parseCommandResponse(result))
                .then((result) => this.parseTransaction(result));
    }

    signTransaction(transactionHex) {
        this.log.info(`Electrum::signTransaction`);
        var cmd = `electrum signtransaction ${transactionHex} -W '${this.password}'`;
        return Electrum.api(cmd)
                .then((result) => this.parseCommandResponse(result))
                .then((result) => this.parseSignTransaction(result));
    }

    broadcastTransaction(signedTransactionHex) {
        this.log.info(`Electrum::broadcastTransaction`);
        var cmd = `electrum broadcast ${signedTransactionHex}`;
        return Electrum.api(cmd)
                .then((result) => this.parseCommandResponse(result))
                .then((result) => this.parseBroadcastTransaction(result));
    }
    
    consolidateCoins(destinationAddress, minConsolidateAmount, customMinerFee) {
        this.log.info(`Electrum::consolidateCoins:: destinationAddress:${destinationAddress}`);
        if(!isNaN(customMinerFee)){
            this.log.info(`Electrum::consolidateCoins:: setting custom miner fee :${customMinerFee}`);
            this.minerFee = parseFloat(customMinerFee);
        }
        return this.sendCoins(destinationAddress, '!');
    }
    
    generateWalletFiles(walletId) {
        this.log.info(`Electrum::generateWalletFiles walletName: ${walletId}`);
        if(!walletId || !this.password) {
            return Promise.reject(`Electrum::generateWalletFiles INVALID PARAMS walletId: ${walletId} password: ${this.password}`);
        }
        return Promise.resolve()
                .then(() => super.generateWalletPath(walletId))
                .then(() => super.saveMetadata())
                .then(() => this.generateWalletFile(this.password));
    }

    /////////////////////////////////
    /////// ELECTRUM SPECIFIC ///////
    /////////////////////////////////

    getAddressData() {
        this.log.info(`Electrum::getAddressData`);
        var cmd = `electrum listaddresses --balance`;
        return Electrum.api(cmd)
                .then((result) => this.parseCommandResponse(result));
    }
    
    createAddressesFromData(addressData) {
        this.log.info(`Electrum::createAddressesFromData`);
        addressData.forEach((addressData, index) => {
           const addressString = addressData[0];
           const balance = addressData[1];
           this.addAddress(addressString, index, balance);
        });
    }

    generateWalletFile(password) {
        this.log.info(`Electrum::generateWalletFile::`);
        // todo: pass password down to create
        var cmd = `electrum create`;
        return Electrum.api(cmd)
                .then((result) => this.parseGenerateWallet(result));
    }
    
    parseCommandResponse(result) {
        this.log.info(`Electrum::parseCommandResponse`);
        var stdout = result.stdout;
        var stderr = result.stderr;
        var parsedResponse = JSON.parse(stdout); //todo try catch
        stderr ? console.error(stdout) : null;
        return Promise.resolve(parsedResponse);
    }
    
    parseGenerateWallet(result) {
        var stdout = result.stdout;
        var stderr = result.stderr;
        console.log(stdout);
        return Promise.resolve(stdout);
    }

    parseBalance(result) {
        var unconfirmed = result.unconfirmed ? parseFloat(result.unconfirmed) : 0;
        var balance = parseFloat(result.confirmed) + unconfirmed;
        return Promise.resolve(balance);
    }

    parseTransaction(result) {
        var transactionHex = result.hex;
        return Promise.resolve(transactionHex);
    }

    parseSignTransaction(result) {
        var signedTransactionHex = result.hex;
        return Promise.resolve(signedTransactionHex);
    }

//        result = [ true,
//  'c0bcd7ee967f0e10b25784edc52300793e3b9f6232b5a0b68cf2b6fc014ddeac' ]
    parseBroadcastTransaction(result) {
        if (Array.isArray(result) && 
                result.length > 0 && 
                result[0] === true) {
            return Promise.resolve(result[1]);
        } else {
            this.log.info(`Electrum::parseBroadcastTransaction result: ${result}`);
            return Promise.reject(result);
        }
    }

}

Electrum.schemas = Schemas;
Electrum.api = exec;

module.exports = Electrum;