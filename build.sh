#!/usr/bin/env bash

set -e errexit
set -o pipefail
set -o xtrace

BUILD_DIR=$(pwd)/build
TMP_DIR=$(pwd)/tmp

mkdir -p $BUILD_DIR $TMP_DIR

rm -rf $TMP_DIR/chrome
cp -R chrome $TMP_DIR/
cd $TMP_DIR/chrome

VERSION=`ruby -rjson -e 'puts JSON.load($stdin.read).fetch("version")' < manifest.json`

CHROME_EXT_FN=$BUILD_DIR/mokum-chrome-extension-$VERSION.zip
FIREFOX_EXT_FN=$BUILD_DIR/mokum-firefox-extension-$VERSION.zip
rm -f $CHROME_EXT_FN $FIREFOX_EXT_FN
zip -r $FIREFOX_EXT_FN .
ruby -rjson -e 'j = JSON.load($stdin.read); j.delete("applications"); puts JSON.dump(j)' < ./manifest.json > ./manifest2.json
mv manifest2.json manifest.json
zip -r $CHROME_EXT_FN .

