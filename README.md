# tic-tac-toe [![Build Status](https://travis-ci.org/baygeldin/tic-tac-toe.svg?branch=master)](https://travis-ci.org/baygeldin/tic-tac-toe)
This is a test assignment for a JavaScript developer job. It is a simple tic-tac-toe game with WebSockets and WebRTC chats written in JavaScript using React and Node.js.

## Screenshots
![menu](https://cloud.githubusercontent.com/assets/6882605/24894788/41036fbe-1e95-11e7-95b9-b6c6f29863bc.PNG)
![game](https://cloud.githubusercontent.com/assets/6882605/24894785/3e624e88-1e95-11e7-901e-062a0bcfafe2.PNG)

## Requirements
* Node.js >= 7.6.0
* Chrome or Firefox for WebRTC video chat

## Running tests
```sh
$ npm install
$ npm test
```

## Running on localhost
```sh
$ npm install
$ npm watch
```
This will start nodemon and webpack-dev-server (with hot reloading). Visit `http://localhost:3000` (or provide another port with PORT environment variable). **Note:** WebRTC video chat will work only on localhost in Chrome. If you want to access the server from another computer in your subnetwork you will have to either configure HTTPS or start a reverse HTTP proxy like so (nginx configuration):
```nginx
server {
  listen 3000;
  server_name localhost;

  location / {
    proxy_pass http://192.168.0.2:3000;
  }

  location /socket.io/ {
    proxy_pass http://192.168.0.2:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
    
server {
  listen 9000;
  server_name localhost;

  location / {
    proxy_pass http://192.168.0.2:9000;
  }

  location /sockjs-node/ {
    proxy_pass http://192.168.0.2:9000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```
