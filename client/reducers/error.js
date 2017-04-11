import { INTERRUPT } from 'constants'

export default (state = false, action) => {
  switch (action.type) {
    case INTERRUPT:
      return true
    default:
      return state
  }
}
