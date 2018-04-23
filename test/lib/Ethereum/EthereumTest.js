var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var assert = chai.assert;
chai.should();
chai.use(sinonChai);

var Ethereum = require('../../../lib/ethereum/Ethereum');
var Wallet = require('../../../lib/wallet/Wallet');
var Slack = require('../../../lib/slack/Slack');
var Contract = require('../../../lib/ethereum/Contract');

describe('lib::Ethereum', function () {
    var etherWallet;
    var slack;
    let walletInitStub;
    let consolidateCoinsStub;
    let setPasswordStub;
    let initWalletAccessStub;
    let isSyncingStub;
    let walletValidateStub;

    beforeEach(function (done) {
        slack = sinon.stub(Slack.prototype, 'postMessage');
        setPasswordStub = sinon.stub(Wallet.prototype, 'setPassword');
        walletInitStub = sinon.stub(Wallet.prototype, 'init');
        walletInitStub.resolves();
        consolidateCoinsStub = sinon.stub(Wallet.prototype, 'consolidateCoins');
        consolidateCoinsStub.resolves();
        isSyncingStub = sinon.stub(Ethereum.prototype, 'isSyncing');
        isSyncingStub.returns(false);
        initWalletAccessStub = sinon.stub(Ethereum.prototype, 'initWalletAccess');
        initWalletAccessStub.returns();
        walletValidateStub = sinon.stub(Wallet.prototype, 'validate');
        walletValidateStub.resolves();
        etherWallet = Wallet.createWallet({coin: 'ETH', walletId: 'eth_btc1'});
        etherWallet.addressDelayMultiple = 1;
        etherWallet.syncDelay = 1;
        done();
    });

    afterEach(function (done) {
        slack.restore();
        walletInitStub.restore();
        consolidateCoinsStub.restore();
        initWalletAccessStub.restore();
        setPasswordStub.restore();
        isSyncingStub.restore();
        walletValidateStub.restore();
        done();
    });

    describe('Ethereum::construct', function () {
        it('should set appropriate values', function (done) {
            //todo: pass fake config in with miner fees instead of checking the hard coded miner fee
            expect(etherWallet.minerFee).to.equal(0.007);
            assert(etherWallet.unlockAccountInSeconds);
            assert(etherWallet.addressDelayMultiple);
            assert(etherWallet.jsonRPCTimeout);
            assert(etherWallet.jsonRPCPort);
            assert(etherWallet.blockNumbers);
            assert(etherWallet.web3);
            done();
        });
    });

    describe('Ethereum::init', function () {
        it('should delay twice if is syncing', function (done) {
            isSyncingStub.onCall(0).returns(true);
            isSyncingStub.onCall(1).returns(true);
            isSyncingStub.onCall(2).returns(false);
            etherWallet.init()
                    .then(() => {
                        expect(walletInitStub.callCount).to.equal(1);
                        done();         
                    });
        });
    });

    describe('Ethereum::getAddressBalance', function () {

        it('should get ether balance ', function (done) {
            delete etherWallet.contract;
            const getEtherBalanceStub = sinon.stub(etherWallet.web3.eth, 'getBalance');
            getEtherBalanceStub.yields(null, '65677446000000000000');
            etherWallet.getAddressBalance('myfakeaddress')
                    .then((balance) => {
                        expect(balance).to.equal(65.677446);
                        done();
                    })
                    .catch((err) => {
                        console.error(err);
                    });
        });

    });

    describe('Ethereum::getFundingAddress', function () {

        var getAddresses;
        var getAddressBalance;

        var fakeAddresses1 = [
            'sdfgsdfgsd',
            'fdghdfghdfg',
            'ergxdfge'
        ];

        var fakeAddresses2 = [
            'sdfgsdfgsd',
            'fdghdfghdfg',
            'ergxdfge',
            'yuktyu',
            'ddfvsdfvb'
        ];

        beforeEach(function (done) {
            getAddressBalance = sinon.stub(etherWallet.web3.eth, 'getBalance');
            walletInitStub.restore();
            done();
        });

        afterEach(function (done) {
            getAddresses.restore();
            getAddressBalance.restore();
            done();
        });

        it('should get second address in list because it has the highest amount', function (done) {
            getAddresses = sinon.stub(etherWallet, 'getAddresses');
            getAddresses.returns(fakeAddresses1);
            getAddressBalance.onCall(0).yields(null, 3);
            getAddressBalance.onCall(1).yields(null, 456);
            getAddressBalance.onCall(2).yields(null, 2);
            etherWallet.getFundingAddress()
                    .then((fundingAddress) => {
                        expect(fundingAddress).to.equal('fdghdfghdfg');
                        done();
                    })
                    .catch((err) => console.error(err));
        });

        it('should get fifth address in list because it has the highest amount', function (done) {

            getAddresses = sinon.stub(etherWallet, 'getAddresses');
            getAddresses.returns(fakeAddresses2);
            getAddressBalance.onCall(0).yields(null, 3);
            getAddressBalance.onCall(1).yields(null, 46);
            getAddressBalance.onCall(2).yields(null, 2);
            getAddressBalance.onCall(3).yields(null, 0);
            getAddressBalance.onCall(4).yields(null, 88);

            etherWallet.getFundingAddress()
                    .then((fundingAddress) => {

                        expect(fundingAddress).to.equal('ddfvsdfvb');
                        done();
                    })
                    .catch((err) => console.error(err));
        });

        it('should calculate correct balance', function (done) {
            getAddresses = sinon.stub(etherWallet, 'getAddresses');
            getAddresses.returns(fakeAddresses1);
            getAddressBalance.onCall(0).yields(null,   30000000000000000);
            getAddressBalance.onCall(1).yields(null, 4560000000000000000);
            getAddressBalance.onCall(2).yields(null,   20000000000000000);
            etherWallet.init()
                    .then(() => {
                        expect(etherWallet.calculateBalance()).to.equal(4.61);
                        done();
                    })
                    .catch((err) => console.error(err));
        });
    });

});