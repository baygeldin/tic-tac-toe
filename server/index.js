const http = require('http')
const fs = require('fs')
const path = require('path')
const socket = require('socket.io')
const Koa = require('koa')
const serve = require('koa-static')
const Promise = require('bluebird')
const Game = require('./game.js')

let app = new Koa()
let server = http.createServer(app.callback())
let io = socket(server)

// TODO: 404 template, comment, modules

// Collection of all current games
let games = []

io.on('connection', (socket) => {
  let game, player

  // Checks if the user has joined some game
  function checkGame (fn) {
    if (!game) fn('No game assigned.')
    return !!game
  }

  socket.on('join', (id, fn) => {
    fn = fn || (() => {})

    // Associate a specific game with a socket
    game = games.find((g) => g.id === id)

    // Allow only two players
    try {
      // player === 1 means crosses, 2 means noughts
      player = game.join()

      // Notify users when the game is over
      game.on('end', (p) => {
        p === player ? socket.emit('win') : socket.emit('lose')
      })

      socket.join(id)
      fn(null)
    } catch (e) {
      fn(e.message)
    }

    // Emit start when 2nd player joins the game
    if (game.players === 2) {
      io.to(id).emit('start', game.config)
    }
  })

  socket.on('configure', (data, fn) => {
    fn = fn || (() => {})
    if (!checkGame(fn)) return

    if (game.started) {
      fn('The game has already started.')
    } else {
      try {
        game.configure(data)
        fn(null)
      } catch (e) {
        fn(e.message)
      }
    }
  })

  socket.on('move', (data, fn) => {
    fn = fn || (() => {})
    if (!checkGame(fn)) return

    if (player !== game.next) {
      fn('Not your turn.')
      return
    }

    try {
      game.move(data)
      socket.to(game.id).emit('move', data)
      fn(null)
    } catch (e) {
      fn(e.message)
    }
  })

  socket.on('message', (data, fn) => {
    fn = fn || (() => {})
    if (!checkGame(fn)) return
    socket.to(game.id).emit('message', data)
    fn(null)
  })

  // Used mostly for testing purposes.
  // It can be used to synchronize the state though (e.g. on reloads).
  socket.on('state', (fn) => {
    fn = fn || (() => {})
    if (!checkGame(fn)) return
    let { config, board, started, next } = game
    fn(null, { config, board, started, next })
  })

  socket.on('disconnect', () => {
    if (game) {
      socket.to(game.id).emit('interrupt')
      games = games.filter((g) => g.id !== game.id)
    }
  })
})

app.use(async (ctx, next) => {
  if (ctx.path === '/') {
    let game = new Game()
    games.push(game)
    ctx.redirect(`/${game.id}`)
  }
  await next()
})

let readFile = Promise.promisify(fs.readFile)

app.use(async (ctx, next) => {
  if (games.find((g) => g.id === ctx.path.substring(1) && !g.started)) {
    ctx.body = await readFile('../static/index.html', 'utf-8')
  }
})

app.use(serve(path.resolve(__dirname, '../static')))

server.listen(process.env.PORT || 3000)

module.exports = { server, io, app }
