## Build

Don't forget to ```npm cache clean```!

### Build Linux64 / Darwin64 / Windows64(Offsite)

```
cd /xxiivv/Nataniev/public/public.projects/sources/Left/

git pull

rm -r /xxiivv/Nataniev/public/public.projects/builds/Left-linux-x64/ 
rm /xxiivv/Nataniev/public/public.projects/builds/left_lin64.zip
electron-packager . Left --platform=linux --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.7.5 --icon=icon.ico

rm -r /xxiivv/Nataniev/public/public.projects/builds/Left-win32-x64/ 
rm /xxiivv/Nataniev/public/public.projects/builds/left_win64.zip
electron-packager . Left --platform=win32 --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.7.5 --icon=icon.ico

rm -r /xxiivv/Nataniev/public/public.projects/builds/Left-darwin-x64/
rm /xxiivv/Nataniev/public/public.projects/builds/left_osx64.zip
electron-packager . Left --platform=darwin --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.7.5 --icon=icon.icns

cd /xxiivv/Nataniev/public/public.projects/builds/

~/butler push /xxiivv/Nataniev/public/public.projects/builds/Left-linux-x64/ hundredrabbits/left:linux-64
~/butler push /xxiivv/Nataniev/public/public.projects/builds/Left-win32-x64/ hundredrabbits/left:windows-64
~/butler push /xxiivv/Nataniev/public/public.projects/builds/Left-darwin-x64/ hundredrabbits/left:osx-64

rm -r /xxiivv/Nataniev/public/public.projects/builds/Left-darwin-x64/
rm -r /xxiivv/Nataniev/public/public.projects/builds/Left-linux-x64/
rm -r /xxiivv/Nataniev/public/public.projects/builds/Left-win32-x64/

~/butler status hundredrabbits/left
```

### Build Linux64 / Darwin64 / Windows64(Local)
```
cd /Users/VillaMoirai/Desktop/
rm -r /Users/VillaMoirai/Desktop/Left-darwin-x64/ 
rm -r /Users/VillaMoirai/Desktop/Left-linux-x64/ 
rm -r /Users/VillaMoirai/Desktop/Left-win32-x64/ 

cd /Users/VillaMoirai/Github/HundredRabbits/Left/
electron-packager . Left --platform=darwin --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns

cd /Users/VillaMoirai/Github/HundredRabbits/Left/
electron-packager . Left --platform=linux --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.ico

cd /Users/VillaMoirai/Github/HundredRabbits/Left/
electron-packager . Left --platform=win32 --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.ico
```
