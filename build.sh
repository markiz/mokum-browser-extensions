#!/usr/bin/env bash

mkdir -p build
mkdir -p tmp
cp -R chrome tmp/
cd tmp/chrome/
rm -f ../../build/mokum-chrome-extension.zip
zip -r ../../build/mokum-chrome-extension.zip .
