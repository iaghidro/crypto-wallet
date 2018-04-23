#!/bin/bash

echo "::Cron:: Start";

# CHECK AND RESTART PARITY
while :
do
    echo "::Cron::startParity waiting for starting parity"
    SLEEP_FOR_SECONDS=240;
    echo "::Cron::startParity sleep for ${SLEEP_FOR_SECONDS} seconds";
    sleep $SLEEP_FOR_SECONDS;
    echo "::Cron::startParity starting parity"
    npm run startParity;
done &

# CONSOLIDATE ETHEREUM
while :
do
    echo "::Cron::consolidateEthereum waiting"
    SLEEP_FOR_SECONDS=4000;
    echo "::Cron::consolidateEthereum sleep for ${SLEEP_FOR_SECONDS} seconds";
    sleep $SLEEP_FOR_SECONDS;
    echo "::Cron::consolidateEthereum consolidating"
    npm run consolidateEther;
done &

# LOG WALLET BALANCES
while :
do
    echo "::Cron::logWalletBalances waiting"
    SLEEP_FOR_SECONDS=1800;
    echo "::Cron::logWalletBalances sleep for ${SLEEP_FOR_SECONDS} seconds";
    sleep $SLEEP_FOR_SECONDS;
    echo "::Cron::logWalletBalances consolidating"
    npm run logWalletBalance ETH;
done &

# DISPERSE ETHEREUM
#while :
#do
#    echo "::Cron::disperseEthereum waiting"
#    SLEEP_FOR_SECONDS=5400;
#    echo "::Cron::disperseEthereum sleep for ${SLEEP_FOR_SECONDS} seconds";
#    sleep $SLEEP_FOR_SECONDS;
#    echo "::Cron::disperseEthereum consolidating"
#    npm run disperseEther;
#done &

# CHANGE IP OF NETWORKING INTERFACE
#while :
#do
#    echo "::Cron::changeIp waiting for ip change"
#    SLEEP_FOR_SECONDS=3600;
#    echo "::Cron::changeIp sleep for ${SLEEP_FOR_SECONDS} seconds";
#    sleep $SLEEP_FOR_SECONDS;
#    echo "::Cron::changeIp changing IP"
#    npm run changeip;
#    echo "::Cron:: Display IP address ";
#    curl ipinfo.io/ip;
#done &