// This file contains a collection for storing application data (in memory).

const debug = require('debug')('tic-tac-toe:collection')
const Game = require('./game.js')

class GamesCollection {
  constructor () {
    this._collection = []
  }

  destroyGame (game) {
    this._collection = this._collection.filter((g) => g.id !== game.id)
    debug(`Game ${game.id} has been destroyed.`)
  }

  addGame () {
    let game = new Game()
    this._collection.push(game)
    debug(`Game ${game.id} has been created.`)
    return game
  }

  findGame (id) {
    return this._collection.find((g) => g.id === id)
  }
}

module.exports = GamesCollection
