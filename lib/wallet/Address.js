
class Address {

    constructor(params = {}) {
        this.log = params.log;
        this.addressString = params.addressString;
        this.index = parseFloat(params.index);
        this.balance = !isNaN(params.balance) ? parseFloat(params.balance) : 0;
    }
    
    setBalance(balance) {
        this.balance = balance;
        this.log.info(`Address::setBalance address: ${this.addressString} balance: ${this.balance}`);
    }
}


module.exports = Address;