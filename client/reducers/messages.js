import { MESSAGE } from 'constants'

export default (state = [], action) => {
  switch (action.type) {
    case MESSAGE:
      let { player, text } = action
      return state.concat({ player, text })
    default:
      return state
  }
}
