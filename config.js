const config = {
    coins: {
        "BTC": {
            symbol              : "BTC",
            name                : "bitcoin",
            walletBasePath      : "bitcoin",
            minerFee            : 0.0021,
            transactionBaseUrl  : "https://blockchain.info/tx/"
        },
        "ETH": {
            symbol              : "ETH",
            name                : "ether",
            walletBasePath      : "ether",
            minerFee            : 0.007,
            transactionBaseUrl  : "https://etherscan.io/tx/"
        },
        "GNT": {
            symbol              : "GNT",
            name                : "golem",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0xa74476443119a942de498590fe1f2454d7d4ac0d"
        },
        "REP": {
            symbol              : "REP",
            name                : "augur",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0xE94327D07Fc17907b4DB788E5aDf2ed424adDff6"
        },
        "EOS": {
            symbol              : "EOS",
            name                : "eos",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0"
        },
        "1ST": {
            symbol              : "1ST",
            name                : "FirstBlood",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0xaf30d2a7e90d7dc361c8c4585e9bb7d2f6f15bc7"
        },
        "BAT": {
            symbol              : "BAT",
            name                : "BasicAttentionToken",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0x0d8775f648430679a709e98d2b0cb6250d2887ef"
        },
        "GNO": {
            symbol              : "GNO",
            name                : "Gnosis",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0x6810e776880C02933D47DB1b9fc05908e5386b96"
        },
        "IOT": {
            symbol              : "IOT",
            name                : "MIOTA",
            walletBasePath      : "iota",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://iotasear.ch/"
        },
        "BNT": {
            symbol              : "BNT",
            name                : "Bancor",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C"
        },
        "ANT": {
            symbol              : "ANT",
            name                : "Aragon",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0x960b236A07cf122663c4303350609A66A7B288C0"
        },
        "SNT": {
            symbol              : "SNT",
            name                : "Status",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0x744d70FDBE2Ba4CF95131626614a1763DF805B9E"
        },
        "ZRX": {
            symbol              : "ZRX",
            name                : "0XProject",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0xE41d2489571d322189246DaFA5ebDe1F4699F498"
        },
        "EDG": {
            symbol              : "EDG",
            name                : "Edgeless",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0x08711d3b02c8758f2fb3ab4e80228418a7f8e39c"
        },
        "RLC": {
            symbol              : "RLC",
            name                : "iExec",
            walletBasePath      : "ether",
            minerFee            : 0.0,
            transactionBaseUrl  : "https://etherscan.io/tx/",
            contractAddress     : "0x607F4C5BB672230e8672085532f7e901544a7375"
        }
    }
};

module.exports = config;