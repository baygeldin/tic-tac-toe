// This file contains an implementation of server's public interface.

const http = require('http')
const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const socket = require('socket.io')
const serve = require('koa-static')
const Promise = require('bluebird')
const initAPI = require('./api.js')
const GamesCollection = require('./collection.js')

const PROD = process.env.NODE_ENV === 'production'

let app = new Koa()
let server = http.createServer(app.callback())
let io = socket(server)

// Collection of all current games.
let games = new GamesCollection()

// Initialize WebSockets API
initAPI(io, games)

// Proxy requests to webpack-dev-server.
if (!PROD) {
  app.use(require('koa-proxy')({
    host: 'http://localhost:9000',
    match: /^\/dist\//
  }))
}

let readFile = Promise.promisify(fs.readFile)

// Serve custom Not Found page.
app.use(async (ctx, next) => {
  await next()

  if (ctx.status === 404) {
    ctx.body = await readFile(path.resolve(__dirname, 'views/404.html'), 'utf-8')
    ctx.status = 404
  }
})

// Return index.html for all open games.
app.use(async (ctx, next) => {
  let game = games.findGame(ctx.path.substring(1))

  if (game && !game.started) {
    ctx.body = await readFile(path.resolve(__dirname, 'views/game.html'), 'utf-8')
  }

  await next()
})

// Create a new game when users accesses root.
app.use(async (ctx, next) => {
  if (ctx.path === '/' || ctx.path === '/index.html') {
    let game = games.addGame()
    // We should delete a game if no one joins it
    // (otherwise, DOS attack is very possible).
    setTimeout(() => { if (game.players === 0) games.destroyGame(game) }, 5000)
    ctx.redirect(`/${game.id}`)
  }

  await next()
})

// Serve static assets.
app.use(serve(path.resolve(__dirname, '../static')))

server.listen(process.env.PORT || 3000)

module.exports = { server, io, app }
