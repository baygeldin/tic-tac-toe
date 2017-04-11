import { MOVE, CONFIGURE } from 'constants'

const MIN_SIZE = 3

function createBoard (size) {
  return (new Array(size).fill(null))
    .map((r) => new Array(size).fill(0))
}

export default (state = createBoard(MIN_SIZE), action) => {
  switch (action.type) {
    case MOVE:
      let { position: { x, y }, player } = action
      return state.map((r, idX) => state[idX].map((c, idY) =>
        x === idX && y === idY ? player : state[idX][idY]))
    case CONFIGURE:
      let size = action.config.size
      return size ? createBoard(action.config.size) : state
    default:
      return state
  }
}
