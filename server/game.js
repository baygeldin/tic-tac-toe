// This file contains an implementation of tic-tac-toe game
// (with some additional application specific features).

const { EventEmitter } = require('events')
const crypto = require('crypto')
const debug = require('debug')('tic-tac-toe:game')

const MIN_SIZE = 3
const MIN_LINE = 3
const MAX_SIZE = 10
const MAX_LINE = 5

class Game extends EventEmitter {
  constructor () {
    super()

    this._id = crypto.randomBytes(10).toString('hex')
    this._config = { size: MIN_SIZE, line: MIN_LINE, enableVideo: true }
    // Whose turn is next.
    this._next = 1
    // Number of players joined.
    this._players = 0
    // Empty cells left.
    this._cells = MIN_SIZE ** 2
    this._createBoard(MIN_SIZE)
  }

  _createBoard (size) {
    this._board = (new Array(size).fill(null))
      .map((r) => new Array(size).fill(0))
  }

  // Checks array of cells to contain winning sequence for the current player.
  _checkLine (arr) {
    return arr.join('').includes(this._next.toString().repeat(this._config.line))
  }

  // Checks if the last move is a winning one and emits an event if so.
  _checkWinner ({ x, y }) {
    let { line, size } = this._config

    let horizontal = []
    let vertical = []
    let downDiagonal = []
    let upDiagonal = []

    for (let i = -line + 1; i < line; i++) {
      if (y + i >= 0 && y + i < size) {
        horizontal.push(this._board[x][y + i])
      }

      if (x + i >= 0 && x + i < size) {
        vertical.push(this._board[x + i][y])
      }

      if (y + i >= 0 && y + i < size &&
        x + i >= 0 && x + i < size) {
        downDiagonal.push(this._board[x + i][y + i])
      }

      if (y + i >= 0 && y + i < size &&
        x - i >= 0 && x - i < size) {
        upDiagonal.push(this._board[x - i][y + i])
      }
    }

    debug(`Move (${x}, ${y}). ` +
      `Horizontal: ${horizontal}. Vertical: ${vertical}. ` +
      `Downward diagonal: ${downDiagonal}. Upward diagonal: ${upDiagonal}`)

    if (this._checkLine(horizontal) || this._checkLine(vertical) ||
      this._checkLine(downDiagonal) || this._checkLine(upDiagonal)) {
      this.emit('end', this._next)
    } else if (!(--this._cells)) {
      // 0 means a draw.
      this.emit('end', 0)
    }
  }

  get id () { return this._id }

  get players () { return this._players }

  get started () { return this._players > 1 }

  get config () { return this._config }

  get next () { return this._next }

  get board () { return this._board }

  move ({ x, y }) {
    if (x >= 0 && x <= this._config.size &&
      y >= 0 && y <= this._config.size &&
      !this._board[x][y]) {
      this._board[x][y] = this._next
      this._checkWinner({ x, y })
      this._next = this._next === 1 ? 2 : 1
    } else {
      throw new Error('Wrong move.')
    }
  }

  configure (config) {
    let { size, line, enableVideo } = Object.assign({}, this.config, config)
    if (line <= size && size >= MIN_SIZE && size <= MAX_SIZE &&
      line >= MIN_LINE && line <= MAX_LINE) {
      this._config = { size, line, enableVideo }
      this._cells = size ** 2
      this._createBoard(size)
    } else {
      throw new Error('Wrong configuration.')
    }
  }

  // Returns player's role in the game
  // (i.e. 1 for crosses, 2 for noughts).
  join () {
    if (this._players < 2) {
      return ++this._players
    } else {
      throw new Error('Too many players.')
    }
  }
}

module.exports = Game
