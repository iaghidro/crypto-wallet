var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var assert = chai.assert;
chai.should();
chai.use(sinonChai);

var config = require('../../../config');
var Wallet = require('../../../lib/wallet/Wallet');
var app = require('../../../lib');

describe('lib::Wallet', function () {
    var wallet;
    var slack;
    var setPasswordStub;
    let disperseCoinsStub;
    let consolidateCoinsStub;

    beforeEach(function (done) {
        slack = sinon.stub(app.Slack.prototype, 'postMessage');
        setPasswordStub = sinon.stub(Wallet.prototype, 'setPassword');
        done();
    });

    beforeEach(function (done) {
        wallet = Wallet.createWallet({coin: 'ETH', walletId: 'eth_btc1'});
        disperseCoinsStub = sinon.stub(app.CoinDisperser.prototype, 'disperseCoins');
        disperseCoinsStub.resolves();
        consolidateCoinsStub = sinon.stub(app.CoinConsolidator.prototype, 'consolidateCoins');
        consolidateCoinsStub.resolves();
        done();
    });

    afterEach(function (done) {
        slack.restore();
        setPasswordStub.restore();
        disperseCoinsStub.restore();
        consolidateCoinsStub.restore();
        done();
    });

    describe('construct', function () {
        it('should set appropriate values', function (done) {
            expect(wallet.coin).to.equal("ETH");
            done();
        });
    });

    describe('getRandomAddressIndex', function () {
        var fakeAddresses = [
            'sdfgsdfgsd',
            'fdghdfghdfg',
            'ergxdfge',
            'abdfbadfya'
        ];
        it(`should return a random addresse's index`, function (done) {
            wallet.addresses = fakeAddresses;
            var randomIndex = wallet.getRandomAddressIndex();
            var isGreaterThanOrEqualToMin = randomIndex >= 0;
            var isLessThanOrEqualToMin = randomIndex <= 4;
            expect(isGreaterThanOrEqualToMin).to.equal(true);
            expect(isLessThanOrEqualToMin).to.equal(true);
            done();
        });
    });

    describe('consolidateCoins', function () {
        const destinationAddress = 'sdfgs43435g';
        const minConsolidateAmount = 3;
        const customMinerFee = 0.45;
        it('should create consolidateCoins object, and call with correct parameters', function (done) {
            wallet.consolidateCoins(destinationAddress, minConsolidateAmount, customMinerFee)
                    .then(() => {
                        assert(wallet.coinConsolidator);
                        expect(wallet.coinConsolidator.destinationAddress).to.equal(destinationAddress);
                        expect(wallet.coinConsolidator.wallet.minerFee).to.equal(customMinerFee);
                        expect(wallet.coinConsolidator.minConsolidateAmount).to.equal(minConsolidateAmount);
                        expect(consolidateCoinsStub.callCount).to.equal(1);
                        done();
                    })
                    .catch((err) => console.error(err));
        });
    });

    describe('disperseCoins', function () {
        const disperseAmount = 3;
        it('should create coniDisperser object, and call with correct parameters', function (done) {
            wallet.disperseCoins(disperseAmount)
                    .then(() => {
                        assert(wallet.coinDisperser);
                        expect(wallet.coinDisperser.disperseAmount).to.equal(disperseAmount);
                        expect(disperseCoinsStub.callCount).to.equal(1);
                        done();
                    })
                    .catch((err) => console.error(err));
        });
    });

});
