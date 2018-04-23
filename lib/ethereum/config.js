const config = {
    unlockAccountInSeconds     :8000,
    addressDelayMultiple       :50,
    jsonRPCTimeout             :30 * 1000,
    jsonRPCPort                :"http://localhost:8545",
    syncDelay                  : 20 * 1000,
    blockNumbers: {
        earliest    : "earliest",
        latest      : "latest",
        pending     : "pending"
    }
};

module.exports = config;
