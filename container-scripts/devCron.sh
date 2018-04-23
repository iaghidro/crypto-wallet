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
