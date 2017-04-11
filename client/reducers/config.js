import { CONFIGURE } from 'constants'

const MIN_SIZE = 3
const MIN_LINE = 3

let initial = { size: MIN_SIZE, line: MIN_LINE, enableVideo: true }

export default (state = initial, action) => {
  switch (action.type) {
    case CONFIGURE:
      return Object.assign({}, state, action.config)
    default:
      return state
  }
}
