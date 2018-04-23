var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var assert = chai.assert;
chai.should();
chai.use(sinonChai);

var Contract = require('../../../lib/ethereum/Contract');
var Ethereum = require('../../../lib/ethereum/Ethereum');
var Wallet = require('../../../lib/wallet/Wallet');
var Slack = require('../../../lib/slack/Slack');


describe('lib::Contract', function () {
    let slack;

    var contractWallet;
    let walletInitStub;
    let ethereumInitStub;
    let consolidateCoinsStub;
    let initWalletAccessStub;
    let setPasswordStub;

    beforeEach(function (done) {
        slack = sinon.stub(Slack.prototype, 'postMessage');
        done();
    });

    afterEach(function (done) {
        slack.restore();
        done();
    });

    beforeEach(function (done) {
        walletInitStub = sinon.stub(Wallet.prototype, 'init');
        walletInitStub.resolves();
        ethereumInitStub = sinon.stub(Ethereum.prototype, 'init');
        ethereumInitStub.resolves();
        consolidateCoinsStub = sinon.stub(Wallet.prototype, 'consolidateCoins');
        consolidateCoinsStub.resolves();
        initWalletAccessStub = sinon.stub(Ethereum.prototype, 'initWalletAccess');
        initWalletAccessStub.returns();
        setPasswordStub = sinon.stub(Wallet.prototype, 'setPassword');
        contractWallet = Wallet.createWallet({coin: 'GNT', walletId: 'eth_btc1'});
        contractWallet.addressDelayMultiple = 1;
        done();
    });

    afterEach(function (done) {
        walletInitStub.restore();
        ethereumInitStub.restore();
        consolidateCoinsStub.restore();
        initWalletAccessStub.restore();
        setPasswordStub.restore();
        done();
    });

    describe('construct', function () {

        it('should set appropriate values', function (done) {
            assert(contractWallet.log);
            expect(contractWallet.contractAddress).to.equal('0xa74476443119a942de498590fe1f2454d7d4ac0d');
            assert(contractWallet.contract);
            //todo: pass fake config in with miner fees instead of checking the hard coded miner fee
            expect(contractWallet.minerFee).to.equal(0);
            done();
        });

    });

    describe('init', function () {

        let getSymbolStub;
        const symbolResponse = 'SEXY';

        beforeEach(function (done) {
            getSymbolStub = sinon.stub(contractWallet.contract, 'symbol');
            getSymbolStub.yields(null, symbolResponse);
            done();
        });

        afterEach(function (done) {
            getSymbolStub.restore();
            done();
        });

        it('should update symbol', function (done) {
            contractWallet.updateSymbol()
                    .then(() => {
                        expect(contractWallet.symbol).to.equal('SEXY');
                        done();
                    })
                    .catch((err) => {
                        console.error(err);
                    });
        });

    });

    describe('getAddressBalance', function () {

        let getBalanceStub;
        const balanceResponse = 13408979940000000000;

        beforeEach(function (done) {
            getBalanceStub = sinon.stub(contractWallet.contract, 'balanceOf');
            getBalanceStub.yields(null, balanceResponse);
            done();
        });

        afterEach(function (done) {
            getBalanceStub.restore();
            done();
        });

        it('should get contract balance', function (done) {
            contractWallet.getAddressBalance('myfakeaddress')
                    .then((balance) => {
                        expect(balance).to.equal(13.40897994);
                        done();
                    })
                    .catch((err) => {
                        console.error(err);
                    });
        });

    });

    describe('broadcastTransaction', function () {

        let transferStub;
        const transferResponse = 'SOMETRANSFERDATA';


        beforeEach(function (done) {
            transferStub = sinon.stub(contractWallet.contract, 'transfer');
            transferStub.yields(null, transferResponse);
            done();
        });

        afterEach(function (done) {
            transferStub.restore();
            done();
        });

        it('should create transaction object and add contract data to transaction', function (done) {
            const transaction = {
                from: 'sgdfgserg',
                to: 'ergsdrfgse',
                value: 13408979940000000000
            };
            contractWallet.broadcastTransaction(transaction)
                    .then((response) => {
                        expect(transferStub.calledOnce).to.equal(true);
                        expect(response).to.equal('SOMETRANSFERDATA');
                        //TODO: check to, from, and value with sinon args

//                        expect(transaction.from).to.equal('ergsdrfgse');
//                        expect(transaction.data).to.equal('SOMETRANSFERDATA');
//                        assert(transaction.value);
                        done();
                    })
                    .catch((err) => {
                        console.error(err);
                    });
        });

    });

});
