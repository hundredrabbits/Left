#!/bin/bash
cd ~/Github/HundredRabbits/Left/
electron-packager . Left --platform=darwin --arch=x64 --out ~/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns
mv -v ~/Desktop/Left-darwin-x64/Left.app /Applications/
rm -r ~/Desktop/Left-darwin-x64/
open -a "Left"