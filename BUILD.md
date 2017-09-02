## Build

Don't forget to ```npm cache clean```!

### Build Linux64 / Darwin64 / Windows64(Offsite)

```
cd /xxiivv/Nataniev/public/public.projects/sources/Donsol/

rm -r /xxiivv/Nataniev/public/public.projects/builds/Donsol-linux-x64/ 
rm /xxiivv/Nataniev/public/public.projects/builds/donsol_lin64.zip
electron-packager . Donsol --platform=linux --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.6.2

rm -r /xxiivv/Nataniev/public/public.projects/builds/Donsol-win32-x64/ 
rm /xxiivv/Nataniev/public/public.projects/builds/donsol_win64.zip
electron-packager . Donsol --platform=win32 --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.6.2

rm -r /xxiivv/Nataniev/public/public.projects/builds/Donsol-darwin-x64/
rm /xxiivv/Nataniev/public/public.projects/builds/donsol_osx64.zip
electron-packager . Donsol --platform=darwin --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.6.2

cd /xxiivv/Nataniev/public/public.projects/builds/

~/butler push /xxiivv/Nataniev/public/public.projects/builds/Donsol-linux-x64/ hundredrabbits/donsol:linux-64
~/butler push /xxiivv/Nataniev/public/public.projects/builds/Donsol-win32-x64/ hundredrabbits/donsol:windows-64
~/butler push /xxiivv/Nataniev/public/public.projects/builds/Donsol-darwin-x64/ hundredrabbits/donsol:osx-64

rm -r /xxiivv/Nataniev/public/public.projects/builds/Donsol-darwin-x64/
rm -r /xxiivv/Nataniev/public/public.projects/builds/Donsol-linux-x64/
rm -r /xxiivv/Nataniev/public/public.projects/builds/Donsol-win32-x64/

~/butler status hundredrabbits/donsol
```

### Build Linux64 / Darwin64 / Windows64(Local)
```
rm -r /Users/VillaMoirai/Desktop/Left-linux-x64/ 
rm -r /Users/VillaMoirai/Desktop/Left-darwin-x64/ 
rm -r /Users/VillaMoirai/Desktop/Left-win32-x64/ 

cd /Users/VillaMoirai/Github/HundredRabbits/Left/
rm /Users/VillaMoirai/Desktop/left_lin64.zip
electron-packager . Left --platform=linux --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.6.2
cd /Users/VillaMoirai/Desktop/
zip -r left_lin64.zip Left-linux-x64/
rm -r /Users/VillaMoirai/Desktop/Left-linux-x64/ 

cd /Users/VillaMoirai/Github/HundredRabbits/Left/
rm /Users/VillaMoirai/Desktop/left_osx64.zip
electron-packager . Left --platform=darwin --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.6.2
cd /Users/VillaMoirai/Desktop/
zip -r left_osx64.zip Left-darwin-x64/
rm -r /Users/VillaMoirai/Desktop/Left-darwin-x64/ 

cd /Users/VillaMoirai/Github/HundredRabbits/Left/
rm /Users/VillaMoirai/Desktop/left_win64.zip
electron-packager . Left --platform=win32 --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.6.2
cd /Users/VillaMoirai/Desktop/
zip -r left_win64.zip Left-win32-x64/
rm -r /Users/VillaMoirai/Desktop/Left-win32-x64/ 
```
