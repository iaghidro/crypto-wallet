const Big               = require('big.js');
const util              = require('./../util');
const Logger            = require('./../logger/Logger');
const erc20             = require('./abis/erc20');
const ethereumConfig    = require('./config');
const Ethereum          = require('./Ethereum');

class Contract extends Ethereum {

    constructor(params = {}) {
        super(params);
        if(!params.coin){
            this.log.error(`Contract::constructor invalid coin`);
        }
        this.config                 = params.config ? params.config : ethereumConfig;
        this.contractAddress        = this.getContractAddress(this.coin);
        this.log.info(`Contract::constructor minerFee: ${this.minerFee}  coin: ${this.coin} contractAddress: ${this.contractAddress}`);
        this.createContractInstance();
    }

    init() {
        this.log.info(`Contract::init`);
        return super.init()
//                .then(() => this.updateSymbol());
    }

    getAddressBalance(etherAddress) {
//        this.log.info(`Contract::getAddressBalance`);
        return this.getContractBalance(etherAddress)
                .then((balance) => Promise.resolve(super.convertFromWei(balance)));
    }
    
    broadcastTransaction(transaction) {
        const convertedAmount = this.web3.toHex(transaction.value);
        this.log.info(`Contract::broadcastTransaction toAddress:${transaction.to} amount: ${convertedAmount}`);
        const params = {
            from: transaction.from,
            gas: Big(150000), //todo move to config,
//            gasPrice: transaction.gas
        };
        return new Promise((resolve, reject) => {
            this.contract.transfer(transaction.to, convertedAmount, params, (err, result) => {
                if (err) {
                    this.log.error(`Contract::broadcastTransaction failed toAddress:${transaction.to} amount: ${convertedAmount}`);
                    return reject(err);
                }
                this.log.info(`Contract::broadcastTransaction success toAddress:${transaction.to} amount: ${convertedAmount}`);
                resolve(result);
            });
        });
    }
    
    /////////////////////////////////
    /////////CONTRACT SPECIFIC///////
    /////////////////////////////////

    createContractInstance () {
        this.log.info(`Contract::createContractInstance`);
        this.contract = this.web3.eth.contract(erc20).at(this.contractAddress);
    }
    
    getContractBalance(etherAddress) {
//        this.log.info(`Contract::getContractBalance`);
        return new Promise((resolve, reject) => {
            this.contract.balanceOf(etherAddress, (err, balance) => {
                if(err) {
                    return reject(err);
                }
                resolve(balance);
            });
        });
    }

    getContractAddress (coin) {
        this.log.info(`Contract::getContractAddress coin: ${this.coin} `);
        if (!coin) {
            return;
        }
        return this.coinConfig.contractAddress;
    }

    updateSymbol() {
        this.log.info(`Contract::updateSymbol`);
        return this.getContractSymbol()
                .then((symbol) => this.setSymbol(symbol))
                .then(() => this.validateSymbol())
                .catch((err) => {
                    this.log.info(`Contract::updateSymbol Failed`);
                    this.log.error(err);
                });
    }
    
    getContractSymbol() {
        this.log.info(`Contract::getContractSymbol`);
        return new Promise((resolve, reject) => {
            this.contract.symbol((err, symbol) => {
                if(err) {
                    return reject(err);
                }
                resolve(symbol);
            });
        });
    }

    setSymbol(symbol) {
        this.symbol = symbol;
        this.log.info(`Contract::updateSymbol:: Symbol: ${this.symbol}`);
    }

    validateSymbol() {
        this.log.info(`Contract::validateSymbol:: Symbol: ${this.symbol} coin: ${this.coin}`);
        if (this.symbol.toUpperCase() !== this.coin.toUpperCase()) {
            this.log.error(`Contract::validateSymbol:: invalid Symbol: ${this.symbol} coin: ${this.coin}`);
        }
    }

}

module.exports = Contract;