#!/bin/bash

echo "::installIOTA:: Start";

# INSTALL IOTA 

##echo "::installIOTA:: installing electron";
#npm install -g electron;
##echo "::installIOTA:: installing bower";
#npm install -g bower;

mkdir /iota;
cd /iota;

echo "::installIOTA:: check out iota wallet";
git clone https://github.com/iotaledger/wallet;
cd wallet;
echo "::installIOTA:: checkout iri";
git clone https://github.com/iotaledger/iri;
echo "::installIOTA:: install";
npm install;

#need to download this
cd iri
wget "https://github.com/iotaledger/iri/releases/download/v1.4.1.2/iri-1.4.1.2.jar"

cd ..

echo "::installIOTA:: start";
npm start;
echo "::installIOTA:: compile";
npm run compile;
echo "::installIOTA:: compile linux";
npm run compile:lin;
