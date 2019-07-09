#!/bin/bash

rm -rf bin
mkdir bin

npm run babel . --  --ignore node_modules --out-dir build

cp config.yml build/config.yml

cp package.json build/package.json

cd build

yarn

./node_modules/.bin/pkg . --targets node10-win-x64 --output ../bin/bgpalerter-win-x64

./node_modules/.bin/pkg . --targets node10-linux-x64 --output ../bin/bgpalerter-linux-x64

./node_modules/.bin/pkg . --targets node10-macos-x64 --output ../bin/bgpalerter-macos-x64

cd ../
rm -rf build
