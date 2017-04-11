import { MOVE } from 'constants'

export default (state = 1, action) => {
  switch (action.type) {
    case MOVE:
      return action.player === 1 ? 2 : 1
    default:
      return state
  }
}
