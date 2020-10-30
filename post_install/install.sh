#!/bin/bash

# Copy the application to the user's /opt folder.
sudo cp -r ../* /opt/

# Copy the left.desktop file to the user's local applications folder.
sudo cp left.desktop ~/.local/share/applications/

# Installation complete.
echo "Left has been installed. Enjoy!"