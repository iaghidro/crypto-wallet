var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var assert = chai.assert;
chai.should();
chai.use(sinonChai);

var Wallet = require('../../../lib/wallet/Wallet');
var app = require('../../../lib');

describe('lib::Electrum', function () {
    var electrumWallet;
    var slack;
    var setPasswordStub;
    var getAddressDataStub;

    beforeEach(function (done) {
        slack = sinon.stub(app.Slack.prototype, 'postMessage');
        setPasswordStub = sinon.stub(Wallet.prototype, 'setPassword');
        electrumWallet = Wallet.createWallet({coin: 'BTC', walletId: 'eth_btc1'});
        getAddressDataStub = sinon.stub(app.Electrum.prototype, 'getAddressData');
        done();
    });

    afterEach(function (done) {
        slack.restore();
        setPasswordStub.restore();
        getAddressDataStub.restore();
        done();
    });

    describe('Electrum::construct', function () {

        it('should set appropriate values', function (done) {
            //todo: pass fake config in with miner fees instead of checking the hard coded miner fee
            expect(electrumWallet.minerFee).to.equal(0.0021);
            done();
        });
    });

    describe('Electrum::parseBroadcastTransaction', function () {

        beforeEach(function (done) {
            done();
        });

        afterEach(function (done) {
            done();
        });

        it('should reject with error if result is not an array', function (done) {
            var result = {code: 'errors man'};
            electrumWallet.parseBroadcastTransaction(result)
                    .catch((err) => {
                        expect(err).to.equal(result);
                        done();
                    });
        });

        it('should reject with error if result has length of 1', function (done) {
            var result = ['something'];
            electrumWallet.parseBroadcastTransaction(result)
                    .catch((err) => {
                        expect(err).to.equal(result);
                        done();
                    });
        });

        it('should reject with error if result has first array element not true', function (done) {
            var result = ['something', 'second'];
            electrumWallet.parseBroadcastTransaction(result)
                    .catch((err) => {
                        expect(err).to.equal(result);
                        done();
                    });
        });

        it('should resolve if result has first element true', function (done) {
            var result = [true, 'second'];
            electrumWallet.parseBroadcastTransaction(result)
                    .then((res) => {
                        expect(res).to.equal('second');
                        done();
                    });
        });

    });


    describe('Electrum::updateAddresses', function () {
        const addressData = [
            [
                "1HArp7gr9BHQjQMf3y6W6vHMYqbfEKmR8e",
                "0."
            ],
            [
                "1FMERGVcrSkZTWWD8WMWueagrX4L7qbAnS",
                "4.8"
            ],
            [
                "14iUG9QFHSKmyN4E8qYzAE89SeDKxnHfiq",
                "0."
            ]
        ];
        beforeEach(function (done) {
            done();
        });
        afterEach(function (done) {
            done();
        });
        it('should create addresses with correct data', function (done) {
            getAddressDataStub.resolves(addressData);
            electrumWallet.updateAddresses()
                    .then(() => {
                        expect(electrumWallet.addresses.length).to.equal(3);
                        const firstAddress = electrumWallet.addresses[0];
                        const secondAddress = electrumWallet.addresses[1];
                        const thirdAddress = electrumWallet.addresses[2];
                        expect(firstAddress.addressString).to.equal('1HArp7gr9BHQjQMf3y6W6vHMYqbfEKmR8e');
                        expect(firstAddress.balance).to.equal(0);
                        expect(secondAddress.addressString).to.equal('1FMERGVcrSkZTWWD8WMWueagrX4L7qbAnS');
                        expect(secondAddress.balance).to.equal(4.8);
                        expect(thirdAddress.addressString).to.equal('14iUG9QFHSKmyN4E8qYzAE89SeDKxnHfiq');
                        expect(thirdAddress.balance).to.equal(0);
                        done();
                    })
                    .catch((err) => console.error(err));
        });
    });

});
