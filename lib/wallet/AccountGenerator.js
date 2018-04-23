var util        = require('./../util');
var Logger      = require('./../logger/Logger');

class AccountGenerator {

    constructor(params) {
        this.log                = (params && params.log) || Logger.create();
        this.createdAccounts    = 0;
        this.accountsToCreate   = parseInt(params.accountsToCreate);
        this.password           = params.password;
        this.wallet             = params.wallet;
        this.addresses          = [];
    }
    
    generateAccounts() {
        this.log.info(`AccountGenerator::generateAccounts`);
        return this.wallet.init()
                .then(() => util.doUntil.call(this, this._handleGenerateAccount, this._stopGeneratingCondition))
                .then(() => this.logAddresses())
                .then(() => this._clearAccountsCreated());
    }
    
    logAddresses() {
        this.log.info(`AccountGenerator::logAddresses`);
        var addressesJoined = this.addresses.join('\n');
        var prettyPrintAddresses = `\n${addressesJoined}`;
        this.log.info(`@@@@@@@@@@@@@@@@@@@@@@@@@@`);
        this.log.info(prettyPrintAddresses);
        this.log.info(`@@@@@@@@@@@@@@@@@@@@@@@@@@`);
    }
    
    _stopGeneratingCondition() {
        this.log.info(`AccountGenerator::_stopGeneratingCondition createdAccounts: ${this.createdAccounts}, accountsToCreate: ${this.accountsToCreate}`);
        return this.createdAccounts === this.accountsToCreate;
    }

    _handleGenerateAccount() {
        this.log.info(`AccountGenerator::_handleGenerateAccount`);
        return this.wallet.createNewAddress(this.password)
                .then((address) => this._saveAddress(address))
                .then(() => this._incrementAccountsCreated())
                .catch((err) => this._logError(err));
    }
    
    _incrementAccountsCreated() {
        this.log.info(`AccountGenerator::_incrementAccountsCreated`);
        this.createdAccounts = this.createdAccounts + 1;
    }
    
    _clearAccountsCreated() {
        this.log.info(`AccountGenerator::_clearAccountsCreated`);
        this.createdAccounts    = 0;
        this.addresses          = [];
    }
    
    _saveAddress(address) {
        this.log.info(`@@@@@@@@@@ AccountGenerator::_saveAddress @@@@@@@@@@`);
        this.log.info(address);
        this.addresses.push(address);
    }
    
    _logError(err) {
        this.log.info(`AccountGenerator::_logError`);
        this.log.error(err);
    }
    
}

module.exports = AccountGenerator;
