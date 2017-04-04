/* eslint-env mocha */

// This file contains tests of server's public interface.

const { expect } = require('chai')
const request = require('supertest')
const Promise = require('bluebird')
const io = require('socket.io-client')
const { server, ioServer } = require('../server/index.js')

let host = `http://localhost:${server.address().port}`
let defaultConfig = { size: 3, line: 3 }

// Resolves when a specific event happens
function wait(emitter, type) {
  return new Promise((resolve) => emitter.once(type, resolve))
}

// Emits a message and resolves with acknowledgement or gets rejected
function emit(emitter, type, arg) {
  return Promise.promisify(emitter.emit, { context: emitter })(type, arg)
}

describe('server', () => {
  let room, players

  beforeEach(async () => {
    // Get room's ID
    await request(server)
      .get('/')
      .expect(302)
      .then((res) => { room = res.location })

    // Create players
    players = [null, null].map((p) => io.connect(host))

    // Wait for players to connect
    await Promise.all(players.map((p) => wait(p, 'connect')))
  })

  afterEach(() => {
    players.forEach((p) => p.disconnect())
  })

  it('starts a game when 2nd player joins', async () => {
    // Wait for 1st player to join
    await emit(players[0], 'join', room)
    // Check state (shouldn't be in started state)
    let state = await emit(players[0], 'state')
    expect(state.started).to.equal(false)
    // 2nd player joins the game
    players[1].emit('join', room)
    // Both users should get a 'start' message
    await Promise.all(players.map((p) => wait(p, 'start')))
  })

  it('starts a game with a correct configuration', async () => {
    // Wait for 1st player to join
    await emit(players[0], 'join', room)
    // 1t player changes configuration
    let config = { size: 10, line: 4 }
    await emit(players[0], 'configure', config)
    // 2nd player joins the game
    players[1].emit('join', room)
    // 'start' message should come with a correct confuguration
    let startConfig = await wait(players[1], 'start')
    expect(startConfig).to.deep.equal(config)
  })

  it('denies wrong configurations', async (done) => {
    // Wait for 1st player to join
    await emit(players[0], 'join', room)

    try {
      // 1t player shouldn't be able to set this configuration
      let config = { size: 0, line: 0 }
      await emit(players[0], 'configure', config)
    } catch (e) {
      // The state should also have a correct configuration 
      let state = await emit(players[0], 'state')
      expect(state.config).to.deep.equal(defaultConfig)
      done()
    }
  })

  describe('game started', () => {
    beforeEach(async () => {
      // Wait for a game to start
      players.forEach((p) => p.emit('join', room))
      await Promise.all(players.map((p) => wait(p, 'start')))
    })

    it('allows only two players', async (done) => {
      // Wait for 3rd player to connect
      let third = io.connect(host)
      await wait(third, 'connect')

      try {
        // 3rd player shouldn't be able to join the game
        await emit(third, 'join', room)
      } catch (e) {
        let sockets = ioServer.sockets.adapter.rooms[room].sockets
        expect(Object.keys(sockets).length).to.equal(2)
        done()
      }
    })

    it('denies to change a configuration', async (done) => {
      try {
        // 1t player shouldn't be able to set configuration
        let config = { size: 10, line: 4 }
        await emit(players[0], 'configure', config)
      } catch (e) {
        // The state should also have a correct configuration 
        let state = await emit(players[0], 'state')
        expect(state.config).to.deep.equal(defaultConfig)
        done()
      }
    })

    it('accepts valid moves', async () => {
      // 1st player makes a valid move
      let move = { x: 1, y: 1 }
      players[0].emit('move', move)
      // 2nd player should receive it
      let newMove = await wait(player[2], 'move')
      expect(newMove).to.deep.equal(move)
    })

    it('denies wrong moves', async (done) => {
      try {
        // 1st player shouldn't be able to make this move
        await emit(players[0], 'move', { x: 10, y: 10 })
      } catch (e) {
        // The state should also have a correct data 
        let state = await emit(players[0], 'state')
        expect(state.board).to.deep.equal(
          [[0, 0, 0], [0, 0, 0], [0, 0, 0]])
        done()
      }
    })

    it('keeps player\'s turns in order', async (done) => {
      // 1st player goes first
      let state = await emit(players[0], 'state')
      expect(state.next).to.equal(1)
      // 1st player makes a valid move
      await emit(players[0], 'move', { x: 1, y: 1 })
      // State should update
      state = await emit(players[0], 'state')
      expect(state.next).to.equal(2)

      try {
        // 1st player shouldn't be able to make this move
        await emit(players[0], 'move', { x: 2, y: 2 })
      } catch (e) {
        // The state should also have a correct data 
        let state = await emit(players[0], 'state')
        expect(state.board).to.deep.equal(
          [[0, 0, 0], [0, 1, 0], [0, 0, 0]])
        done()
      }
    })

    it('notifies when there is a winner', async () => {
      // Players make moves in turns
      let turns = [[1, 1], [0, 0], [0, 2], [1, 0]]
      for (let i = 0; i < turns.length; i++) {
        await emit(players[i % 2], { x: t[0], y: t[1] })
      }
      // 1st player makes a winning move
      players[0].emit([2, 0])
      // Corresponding messages are sent to both clients
      await Promise.all([
        wait(players[0], 'win'),
        wait(players[1], 'lose')
      ])
    })

    it('notifies a player when other player disconnects', async () => {
      // 1st player disconnects
      players[0].disconnect()
      // 2nd player should receive an error message
      await wait(players[1], 'error')
    })

    it('exchanges messages between players', async () => {
      // 1st sends a message to the chat
      let msg = 'Ayyo, what you up to?'
      players[0].emit('message', msg)
      // 2nd player should receive it
      let newMsg = await wait(player[2], 'message')
      expect(newMsg).to.deep.equal(msg)
    })
  })
})
