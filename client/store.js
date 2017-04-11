import { createStore, combineReducers,
  applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import started from './reducers/started.js'
import config from './reducers/config.js'
import board from './reducers/board.js'
import messages from './reducers/messages.js'
import next from './reducers/next.js'
import winner from './reducers/winner.js'
import error from './reducers/error.js'
import signal from './reducers/signal.js'
import emitMiddleware from './middleware/emit.js'

const PROD = process.env.NODE_ENV === 'production'

export default (player, socket) => {
  let reducer = combineReducers({
    started,
    config,
    board,
    messages,
    next,
    winner,
    error,
    signal,
    // Let's keep current player in the store.
    player: (state, action) => player
  })

  // Helps to debug redux applications.
  let composeEnhancers = PROD ? compose
    : window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  let middlewares = [emitMiddleware(socket), thunkMiddleware]
  let enhancer = composeEnhancers(applyMiddleware(...middlewares))

  return createStore(reducer, enhancer)
}
