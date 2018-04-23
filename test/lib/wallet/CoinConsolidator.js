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
var CoinConsolidator = require('../../../lib/wallet/CoinConsolidator');

describe('lib::CoinConsolidator', function () {
    let coinConsolidator;
    let slack;
    let walletInitStub;
    let ethereumInitStub;
    let consolidateCoinsStub;
    let initWalletAccessStub;
    let getAddressBalanceStub;
    let sendCoinsStub;
    let setPasswordStub;
    const DESTINATION_ADDRESS = 'sdfug934h5g98w5h';
    const ADDRESSES = [
        {
            addressString: '7658757jhgjhgjh'
        },
        {
            addressString: 'dhfghrthrt'
        }
    ];

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
        coinConsolidator = new CoinConsolidator({
            wallet: Wallet.createWallet({coin: 'ETH', walletId: 'eth_btc1'}),
            minConsolidateAmount: 0.04,
            destinationAddress: DESTINATION_ADDRESS
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

    describe('CoinConsolidator::construct', function () {
        it('should set appropriate values', function (done) {
            expect(coinConsolidator.minConsolidateAmount).to.equal(0.04);
            expect(coinConsolidator.destinationAddress).to.equal('sdfug934h5g98w5h');
            assert(coinConsolidator.wallet);
            done();
        });
    });

    describe('consolidateCoins', function () {
        it('should consolidate coins if balance is above the minConsolidateAmount amount', function (done) {
            getAddressBalanceStub.onCall(0).resolves(0.05);
            getAddressBalanceStub.onCall(1).resolves(0.0);
            coinConsolidator.wallet.addresses = ADDRESSES;
            coinConsolidator.consolidateCoins()
                    .then(() => {
                        const toAddress = sendCoinsStub.args[0][0];
                        const amount = sendCoinsStub.args[0][1];
                        const fromAddress = sendCoinsStub.args[0][2];
                        expect(sendCoinsStub.callCount).to.equal(1);
                        expect(toAddress).to.equal(DESTINATION_ADDRESS);
                        expect(amount).to.equal(0.01);
                        expect(fromAddress).to.equal('7658757jhgjhgjh');
                        done();
                    })
                    .catch((err) => console.error(err));
        });
        it('should not consolidate coins if balance is lower than minConsolidateAmount amount', function (done) {
            getAddressBalanceStub.onCall(0).resolves(0.03);
            getAddressBalanceStub.onCall(1).resolves(0.02);
            coinConsolidator.wallet.addresses = ADDRESSES;
            coinConsolidator.consolidateCoins()
                    .then(() => {
                        expect(sendCoinsStub.callCount).to.equal(0);
                        done();
                    })
                    .catch((err) => console.error(err));
        });
    });


});
