# Crummytile

Open source web app for playing rummikub and other tile/card games

<img width="906" alt="image" src="https://user-images.githubusercontent.com/734221/173209224-e6a09e1b-3014-40d4-b932-712ba9e5a9cf.png">

## Getting started
### Server
The game server is a Node app serving WebSocket connections, files are in `/server`. 

To run, `cd server` then:

1. `npm install` to install dependencies
2. `npm start` to start the server
3. `npm build` to rebuild the server files from source (Typescript) if you change them (must restart server).


### Web Client
The web client is a React app, files are in `/web-client`.

To run, `cd client` then:

1. `npm install` to install dependencies
2. `npm start` to start the web client dev server. Will automatically rebuild if files in `web-client` are changed so you don't need to restart.
3. `npm build` to create a production build if necessary.

### Shared files
Typescript files shared between the client and server are in `/shared`. If you are just running the game server/client and not changing anything, you can ignore this part. If you are changing any files in `/shared`, you need to first `cd shared` and then:

1. `npm install` to install dependencies
2. `npm watch` to start the file watcher, which will automatically rebuild if any `.ts` files in `/shared` change
3. `npm build` to create a production build if necessary
