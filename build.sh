#!/bin/bash

rm -rf bin
mkdir bin

npm run babel . --  --ignore node_modules --out-dir build

cd build

npm install --silent

./node_modules/.bin/pkg . --targets node12-win-x64 --output ../bin/bgpalerter-win-x64

./node_modules/.bin/pkg . --targets node12-linux-x64 --output ../bin/bgpalerter-linux-x64

./node_modules/.bin/pkg . --targets node12-macos-x64 --output ../bin/bgpalerter-macos-x64

cd ../
rm -rf build
