Starbound Server Manager
======================

Starbound Server Manager is a very basic, lightweight Node.js program that starts a child process for the Starbound server, reads console input, and displays useful information on the web. It only supports the same functionality that vanilla Starbound supports, so kicking and banning hasn't been implemented. New features will be added as the game updates.

Demonstration (may be outdated):

server:

![alt tag](http://i.imgur.com/v9Zzlng.gif)

website:

![alt tag](http://i.imgur.com/x9C1pyL.gif)


Getting Started
===============

1. Download and install Node.js here: http://nodejs.org/
2. Download the latest release here: https://github.com/Shadaez/StarboundServerManager/releases 
3. Extract the zip from the previous step whereever you'd like it installed.
4. In the folder you extracted the zip, open up config.json and edit the path to be your starbound folder's root directory
5. Make sure your server isn't up, then run start_server.bat (or alternatively start CMD and run npm install in the folder you extracted it to, then "node app.js")
6. You're done! your game server should be up and the website will be at localhost:8080 (you can change the port in config.json as well)
