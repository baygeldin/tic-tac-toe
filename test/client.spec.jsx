/* eslint-env mocha */

// This file contains tests of the main component's visual interface
// and its interaction with server's API (through a mock).

import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import chaiSinon from 'sinon-chai'
import { mount } from 'enzyme'
import sinon from 'sinon'
import React from 'react'
import { Socket } from 'socket.io'
import * as actions from '../client/actions.js'
import createStore from '../client/store.js'
import Board from 'components/board'
import Chat from 'components/chat'
import Video from 'components/video'
import Config from 'components/config'
import Exception from 'components/exception'
import Results from 'components/results'
import Main from 'components/main'

// Chai configuration.
chai.use(chaiEnzyme())
chai.use(chaiSinon)
const expect = chai.expect

describe('client', () => {
  let wrapper, mock, callbacks

  beforeEach(() => {
    callbacks = {}
    mock = Object.create(Socket.prototype)
    mock.on = (type, cb) => { callbacks[type] = cb }
    mock.emit = sinon.spy()
    wrapper = mount(
      <Main player={1} socket={mock}
        actions={actions} createStore={createStore} />
    )
  })

  describe('configuration', () => {
    let config

    beforeEach(() => {
      config = wrapper.find(Config)
    })

    it('changes enableVideo option', () => {
      config.find('#video').simulate('change', { target: { checked: false } })
      expect(mock.emit).to.have.been.calledWith('configure', { enableVideo: false })
      expect(config.find('#video')).to.not.be.checked()
    })

    it('changes board size configuration', () => {
      config.find('#size').simulate('change', { target: { value: '10' } })
      expect(mock.emit).to.have.been.calledWith('configure', { size: 10 })
      expect(config.find('#size')).to.have.value('10')
    })

    it('changes board size together with line size', () => {
      // Default values for board size and line size is 3.
      // When changing line size to 5 it makes sense to update board size as well.
      config.find('#line').simulate('change', { target: { value: '5' } })
      expect(mock.emit).to.have.been.calledWith('configure', { size: 5, line: 5 })
      expect(config.find('#size')).to.have.value('5')
      expect(config.find('#line')).to.have.value('5')
    })
  })

  describe('game', () => {
    beforeEach(() => {
      // Monkey patching some unsupported API
      // XXX: It is possible to test audio and media streams with stubs!
      let noop = () => {}
      window.Audio = () => ({ load: noop, play: noop })
      navigator.mediaDevices = { getUserMedia: () => Promise.resolve(null) }
      callbacks.start({ size: 3, line: 3, enableVideo: true })
    })

    it('shows a game field when the game starts', () => {
      expect(wrapper).to.have.descendants(Board)
      expect(wrapper).to.have.descendants(Chat)
      expect(wrapper).to.have.descendants(Video)
    })

    describe('chat', () => {
      let chat

      beforeEach(() => {
        chat = wrapper.find(Chat)
      })

      it('receives messages', () => {
        ['lol', 'kek', 'cheburek'].forEach(callbacks.message)
        // Since we are player 1, we receive messages from player 2.
        expect(chat).to.have.exactly(3).descendants('[data-player=2]')
      })

      it('sends messages', () => {
        let form = chat.find('form')
        let input = form.find('input')
        input.simulate('change', { target: { value: 'yugh!' } })
        form.simulate('submit')
        expect(chat).to.have.html().match(/yugh!/)
        expect(mock.emit).to.have.been.calledWith('message', 'yugh!')
      })
    })

    describe('board', () => {
      let board

      beforeEach(() => {
        board = wrapper.find(Board)
      })

      it('receives moves and unblocks the board', () => {
        board.find('[data-id="1-1"]').simulate('click')
        callbacks.move({ x: 0, y: 0 })
        expect(board.find('[data-id="0-0"]')).to.have.data('value', '2')
        expect(board).to.have.prop('disabled', false)
      })

      it('makes moves and disables the board', () => {
        board.find('[data-id="1-1"]').simulate('click')
        expect(mock.emit).to.have.been.calledWith('move', { x: 1, y: 1 })
        expect(board.find('[data-id="1-1"]')).to.have.data('value', '1')
        expect(board).to.have.prop('disabled', true)
      })
    })

    describe('exceptions', () => {
      it('shows an error when player\'s opponent disconnects', () => {
        callbacks.interrupt()
        expect(wrapper).to.have.descendants(Exception)
      })
    })

    it('shows a message in the end of the game', () => {
      callbacks.win()
      expect(wrapper).to.have.descendants(Results)
    })
  })
})
