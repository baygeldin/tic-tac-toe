import { SIGNAL } from 'constants'

export default (state = null, action) => {
  switch (action.type) {
    case SIGNAL:
      return Object.assign({}, action.data)
    default:
      return state
  }
}
