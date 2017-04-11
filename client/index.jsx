/* eslint-env browser */

import React from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io'
import { AppContainer } from 'react-hot-loader'
import * as actions from './actions.js'
import createStore from './store.js'
import Main from 'components/main'

const PROD = process.env.NODE_ENV === 'production'
if (!PROD) localStorage.debug = 'tic-tac-toe,tic-tac-toe:*'

document.addEventListener('DOMContentLoaded', () => {
  let socket = io()

  socket.on('connect', () => {
    socket.emit('join', location.pathname.substring(1), (err, player) => {
      // Error means that the game user is trying to connect is busy or already destroyed.
      // After reloading, user will be shown not found message.
      if (err) {
        location.reload()
        return
      }

      let render = (Component) => {
        ReactDOM.render(
          <AppContainer>
            <Main player={player} socket={socket}
              actions={actions} createStore={createStore} />
          </AppContainer>,
          document.getElementById('app')
        )
      }

      if (module.hot) {
        module.hot.accept('components/main', () => { render() })
      }

      render()
    })
  })
})
