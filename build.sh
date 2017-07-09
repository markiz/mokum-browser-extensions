#!/usr/bin/env bash

mkdir -p build
cd chrome
rm -f ../build/mokum-chrome-extension.zip
zip -r ../build/mokum-chrome-extension.zip .
