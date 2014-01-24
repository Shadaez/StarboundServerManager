Starbound Server Manager
======================

Starbound Server Manager is a very basic, lightweight Node.js program that starts a child process for the Starbound server, reads console input, and displays useful information on the web. It only supports the same functionality that vanilla Starbound supports, so kicking and banning hasn't been implemented. New features will be added as the game updates.

Demonstration (may be outdated):

server:

![alt tag](http://i.imgur.com/v9Zzlng.gif)

website:

![alt tag](http://i.imgur.com/x9C1pyL.gif)

To get it working, first install Node.js. Its website should have the details: http://nodejs.org/ . Then, either git clone the repo into a folder or download the .zip https://github.com/Shadaez/StarboundServerManager/archive/master.zip and extract it. In your CLI, cd into the folder and run npm install. Edit the config.json, and then run node app.js. Your server should be shut down before you run it, or there will be two servers being ran at the same time. To access the web page locally, go to localhost:8080 (or whatever port you set it to).
