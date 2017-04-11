const debug = require('debug')('tic-tac-toe:api')

module.exports = (io, games) => {
  io.on('connection', (socket) => {
    let game, player

    // Checks if the user has joined some game.
    function checkGame (fn) {
      if (!game) fn('No game assigned.')
      return !!game
    }

    socket.on('join', (id, fn) => {
      fn = fn || (() => {})

      // Associate a specific game with a socket.
      game = games.findGame(id)

      // Allow only two players.
      try {
        // player === 1 means crosses, 2 means noughts.
        player = game.join()

        // Notify users when the game is over.
        game.on('end', (p) => {
          socket.emit(p === 0 ? 'draw' : (p === player ? 'win' : 'lose'))
        })

        socket.join(id)
        debug(`Player ${player} joined the ${game.id} game.`)
        fn(null, player)
      } catch (e) {
        fn(e.message)
        return
      }

      // Emit start when 2nd player joins the game.
      if (game.players === 2) {
        debug(`Game ${game.id} starts with %o configuration.`, game.config)
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
      if (!data) {
        fn('Empty message.')
        return
      }
      socket.to(game.id).emit('message', data)
    })

    // Used mostly for testing purposes.
    // It can be used to synchronize the state though (e.g. on reloads).
    socket.on('state', (fn) => {
      fn = fn || (() => {})
      if (!checkGame(fn)) return
      let { config, board, started, next } = game
      fn(null, { config, board, started, next })
    })

    socket.on('offer', (data, fn) => {
      fn = fn || (() => {})
      if (!checkGame(fn)) return
      socket.to(game.id).emit('signal', data)
      fn(null)
    })

    socket.on('disconnect', () => {
      if (game) {
        socket.to(game.id).emit('interrupt')
        games.destroyGame(game)
      }
    })
  })
}
