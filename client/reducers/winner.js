import { FINISH } from 'constants'

export default (state = null, action) => {
  switch (action.type) {
    case FINISH:
      return action.player
    default:
      return state
  }
}
