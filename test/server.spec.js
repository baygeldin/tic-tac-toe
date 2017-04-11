/* eslint-env mocha */

// This file contains tests of server's public interface.

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const request = require('supertest')
const Promise = require('bluebird')
const io = require('socket.io-client')
const { server, io: ioServer } = require('../server/index.js')

// Chai configuration.
chai.use(chaiAsPromised)
const expect = chai.expect

let host = `http://localhost:${server.address().port}`
let defaultConfig = { size: 3, line: 3, enableVideo: true }

// Resolves when a specific event happens.
function wait (emitter, type) {
  return new Promise((resolve) => emitter.once(type, resolve))
}

// Emits a message and resolves with acknowledgement or gets rejected.
function emit (emitter, type, ...args) {
  return Promise.promisify(emitter.emit, { context: emitter })(type, ...args)
}

describe('server', () => {
  let game, players

  beforeEach(async () => {
    // Get game's ID.
    await request(server)
      .get('/')
      .expect(302)
      .then((res) => {
        game = res.headers.location.substring(1)
      })

    // Create players.
    players = [null, null].map((p) => io.connect(host))

    // Wait for players to connect.
    await Promise.all(players.map((p) => wait(p, 'connect')))
  })

  afterEach(() => {
    players.forEach((p) => p.disconnect())
  })

  it('starts a game when 2nd player joins', async () => {
    let start = Promise.all(players.map((p) => wait(p, 'start')))
    // Wait for 1st player to join.
    let player = await emit(players[0], 'join', game)
    // 1st player should get crosses
    expect(player).to.equal(1)
    // Check state (shouldn't be in started state).
    let state = await emit(players[0], 'state')
    expect(state.started).to.equal(false)
    // 2nd player joins the game.
    player = await emit(players[1], 'join', game)
    // 2st player should get noughts
    expect(player).to.equal(2)
    // Both users should get a 'start' message.
    await start
  })

  it('starts a game with a correct configuration', async () => {
    // Wait for 1st player to join.
    await emit(players[0], 'join', game)
    // 1t player changes configuration.
    let config = { size: 10, line: 4, enableVideo: true }
    await emit(players[0], 'configure', config)
    // 2nd player joins the game.
    players[1].emit('join', game)
    // 'start' message should come with a correct confuguration.
    let startConfig = await wait(players[1], 'start')
    expect(startConfig).to.deep.equal(config)
  })

  it('denies wrong configurations', async () => {
    // Wait for 1st player to join.
    await emit(players[0], 'join', game)

    // 1st player shouldn't be able to set this configuration.
    let config = { size: 0, line: 0, enableVideo: true }
    await expect(emit(players[0], 'configure', config)).to.be.rejected

    // The state should also have a correct configuration.
    let state = await emit(players[0], 'state')
    expect(state.config).to.deep.equal(defaultConfig)
  })

  describe('game', () => {
    beforeEach(async () => {
      let start = Promise.all(players.map((p) => wait(p, 'start')))
      // 1st player to join gets crosses
      await emit(players[0], 'join', game)
      // 2st player to join gets noughts
      await emit(players[1], 'join', game)
      // Wait for a game to start.
      await start
    })

    it('allows only two players', async () => {
      // Wait for 3rd player to connect.
      let third = io.connect(host)
      await wait(third, 'connect')

      // 3rd player shouldn't be able to join the game.
      await expect(emit(third, 'join', game)).to.be.rejected

      let sockets = ioServer.sockets.adapter.rooms[game].sockets
      expect(Object.keys(sockets).length).to.equal(2)
    })

    it('denies to change a configuration', async () => {
      // 1t player shouldn't be able to set configuration.
      let config = { size: 10, line: 4 }
      await expect(emit(players[0], 'configure', config)).to.be.rejected

      // The state should also have a correct configuration.
      let state = await emit(players[0], 'state')
      expect(state.config).to.deep.equal(defaultConfig)
    })

    it('accepts valid moves', async () => {
      // 1st player makes a valid move.
      let move = { x: 1, y: 1 }
      players[0].emit('move', move)
      // 2nd player should receive it.
      let newMove = await wait(players[1], 'move')
      expect(newMove).to.deep.equal(move)
    })

    it('denies wrong moves', async () => {
      // 1st player shouldn't be able to make this move.
      await expect(emit(players[0], 'move', { x: 10, y: 10 })).to.be.rejected

      // The state should also have a correct data.
      let state = await emit(players[0], 'state')
      expect(state.board).to.deep.equal(
        [[0, 0, 0], [0, 0, 0], [0, 0, 0]])
    })

    it('keeps player\'s turns in order', async () => {
      // 1st player goes first.
      let state = await emit(players[0], 'state')
      expect(state.next).to.equal(1)
      // 1st player makes a valid move.
      await emit(players[0], 'move', { x: 1, y: 1 })
      // State should update.
      state = await emit(players[0], 'state')
      expect(state.next).to.equal(2)

      // 1st player shouldn't be able to make this move.
      await expect(emit(players[0], 'move', { x: 2, y: 2 })).to.be.rejected

      // The state should also have a correct data.
      state = await emit(players[0], 'state')
      expect(state.board).to.deep.equal(
        [[0, 0, 0], [0, 1, 0], [0, 0, 0]])
    })

    it('notifies when there is a winner', async () => {
      // Players make moves in turns.
      let turns = [[1, 1], [0, 0], [0, 2], [1, 0]]
      for (let i = 0; i < turns.length; i++) {
        await emit(players[i % 2], 'move', { x: turns[i][0], y: turns[i][1] })
      }
      // 1st player makes a winning move.
      players[0].emit('move', { x: 2, y: 0 })
      // Corresponding messages are sent to both clients.
      await Promise.all([
        wait(players[0], 'win'),
        wait(players[1], 'lose')
      ])
    })

    it('notifies a player when other player disconnects', async () => {
      // 1st player disconnects.
      players[0].disconnect()
      // 2nd player should receive an error message.
      await wait(players[1], 'interrupt')
    })

    it('exchanges messages between players', async () => {
      // 1st sends a message to the chat.
      let msg = 'Ayyo, what you up to?'
      players[0].emit('message', msg)
      // 2nd player should receive it.
      let newMsg = await wait(players[1], 'message')
      expect(newMsg).to.deep.equal(msg)
    })
  })
})
