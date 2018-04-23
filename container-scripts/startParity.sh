#!/bin/bash

# parity is not up                    - should restart
# parity is up but error is returned  - should restart
# parity is up and syncing            - do nothing
# parity is up and not syncing        - do nothing

RESPONSE=`curl -X POST http://127.0.0.1:8545 \
    --data '{"jsonrpc":"2.0", "method":"eth_getBalance", "params":["0x1cb47dc62bdde5cb728565256cea5ce08aabfde9", "latest"], "id":1}' \
    -H 'content-type: application/json'`

echo "::startParity:: parity Response:";
echo "::startParity:: ${RESPONSE}";

ERROR=`echo "${RESPONSE}" | jq '.error'`
echo "::startParity:: Has Error :";
echo "::startParity:: ${ERROR}";

if [ "$ERROR" != null ]
then
    # Graceful exit, like pressing Control-C on a program
    echo "::startParity:: Graceful exit";
    killall -HUP parity
    sleep 5;

    # Hard kill, only to stop a process that refuses to terminate
    echo "::startParity:: Hard kill, only to stop a process that refuses to terminate *****";
    killall -HUP parity

    echo "::startParity:: Start parity";
    
    /usr/bin/parity \
    --cache-size 2000 \
    --jsonrpc-interface "127.0.0.1" \
    --jsonrpc-port 8545 \
    --jsonrpc-apis "web3,eth,pubsub,net,parity,parity_pubsub,traces,rpc,secretstore,personal" \
    --jsonrpc-threads 5 \
    --db-compaction ssd \
    --mode "active" \
    --no-serve-light >> /logs/trader.logs &

    echo "::startParity:: Restarted parity successfully";

else
    echo "::startParity:: Geth is up, skipping restart *****";
fi
