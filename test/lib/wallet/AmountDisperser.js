var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var assert = chai.assert;
chai.should();
chai.use(sinonChai);

var config = require('../../../config');
var Wallet = require('../../../lib/wallet/Wallet');
var Slack = require('../../../lib/slack/Slack');
var Ethereum = require('../../../lib/ethereum/Ethereum');
var CoinDisperser = require('../../../lib/wallet/CoinDisperser');

describe('lib::CoinDisperser', function () {
    let coinDisperser;
    let slack;
    let walletInitStub;
    let ethereumInitStub;
    let consolidateCoinsStub;
    let initWalletAccessStub;
    let getAddressBalanceStub;
    let sendCoinsStub;
    let setPasswordStub;

    beforeEach(function (done) {
        slack = sinon.stub(Slack.prototype, 'postMessage');
        done();
    });

    beforeEach(function (done) {
        setPasswordStub = sinon.stub(Wallet.prototype, 'setPassword');
        walletInitStub = sinon.stub(Wallet.prototype, 'init');
        walletInitStub.resolves();
        consolidateCoinsStub = sinon.stub(Wallet.prototype, 'consolidateCoins');
        consolidateCoinsStub.resolves();
        initWalletAccessStub = sinon.stub(Ethereum.prototype, 'initWalletAccess');
        initWalletAccessStub.returns();
        ethereumInitStub = sinon.stub(Ethereum.prototype, 'init');
        ethereumInitStub.resolves();
        getAddressBalanceStub = sinon.stub(Ethereum.prototype, 'getAddressBalance');
        sendCoinsStub = sinon.stub(Ethereum.prototype, 'sendCoins');
        sendCoinsStub.resolves();
        done();
    });

    beforeEach(function (done) {
        coinDisperser = new CoinDisperser({
            wallet: new Wallet.createWallet({coin: 'ETH', walletId: 'eth_btc1'}),
            disperseAmount: 0.01
        });
        done();
    });

    afterEach(function (done) {
        slack.restore();
        setPasswordStub.restore();
        done();
    });

    afterEach(function (done) {
        walletInitStub.restore();
        ethereumInitStub.restore();
        consolidateCoinsStub.restore();
        initWalletAccessStub.restore();
        getAddressBalanceStub.restore();
        sendCoinsStub.restore();
        done();
    });

    describe('CoinDisperser::construct', function () {
        it('should set appropriate values', function (done) {
            done();
        });
    });

    describe('CoinDisperser::coinDisperser', function () {

        it('should disperse amount if balance is lower than disperse amount', function (done) {
            getAddressBalanceStub.resolves(0.0001);
            coinDisperser.wallet.addresses = ['7658757jhgjhgjh'];

            coinDisperser.disperseCoins()
                    .then(() => {
                        expect(sendCoinsStub.callCount).to.equal(1);
                        done();
                    })
                    .catch((err) => console.error(err));
        });

        it('should not disperse amount if balance is higher than disperse amount', function (done) {
            getAddressBalanceStub.resolves(0.1);
            coinDisperser.wallet.addresses = ['7658757jhgjhgjh'];

            coinDisperser.disperseCoins()
                    .then(() => {
                        expect(sendCoinsStub.callCount).to.equal(0);
                        done();
                    })
                    .catch((err) => console.error(err));
        });
    });


});
