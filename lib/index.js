module.exports = {
    util                : require("./util"),
    config              : require("./../config"),
    
    Wallet              : require("./wallet/Wallet"),
    AccountGenerator    : require("./wallet/AccountGenerator"),
    CoinConsolidator    : require("./wallet/CoinConsolidator"),
    CoinDisperser       : require("./wallet/CoinDisperser"),
    
    Electrum            : require("./electrum/Electrum"),
    Ethereum            : require("./ethereum/Ethereum"),
    
    Slack               : require("./slack/Slack"),
    Logger              : require("./logger/Logger")
};