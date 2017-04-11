// This middleware emits messages over socket.io.
// It does NOT change the original action.

import debug from 'debugger'

export default function emitMiddleware (socket) {
  return store => next => action => {
    if (action.emit) {
      let { type, data } = action.emit
      // It is possible to attach a callback to emit method so that
      // we could know whether the operation completed successfully
      // or not and send approproate actions to redux store.
      // It can be used to monitor progress and show spinners.
      // But it's unnecessary for the application at this stage.
      socket.emit(type, data, (err, data) => {
        if (err) debug(`Emitting "${type}" went wrong: ${err}.`)
      })
    }

    return next(action)
  }
}
