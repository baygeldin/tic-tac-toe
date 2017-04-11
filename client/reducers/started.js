import { START } from 'constants'

export default (state = false, action) => {
  switch (action.type) {
    case START:
      return true
    default:
      return state
  }
}
