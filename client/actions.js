import { CONFIGURE, MOVE, MESSAGE, START,
  FINISH, INTERRUPT, OFFER, SIGNAL } from 'constants'

export function move (player, position) {
  return (dispatch, getState) => {
    let { player: currentPlayer } = getState()
    let action = { type: MOVE, player, position }

    // If it's current player's move, send it over socket.io
    if (currentPlayer === player) {
      action.emit = { type: 'move', data: position }
    }

    dispatch(action)
  }
}

export function configure (config) {
  return { type: CONFIGURE, config, emit: { type: 'configure', data: config } }
}

export function message (player, text) {
  return (dispatch, getState) => {
    let { player: currentPlayer } = getState()
    let action = { type: MESSAGE, player, text }

    // If it's current player's message, send it over socket.io
    if (currentPlayer === player) {
      action.emit = { type: 'message', data: text }
    }

    dispatch(action)
  }
}

export function start (config) {
  return (dispatch) => {
    dispatch({ type: CONFIGURE, config })
    dispatch({ type: START })
  }
}

// Sends WebRTC offers and answers.
export function offer (data) {
  return { type: OFFER, emit: { type: 'offer', data } }
}

// Receives WebRTC offers and answers.
export function receive (data) {
  return { type: SIGNAL, data }
}

// 0 means a draw.
export function finish (player = 0) {
  return { type: FINISH, player }
}

export function interrupt () {
  return { type: INTERRUPT }
}
