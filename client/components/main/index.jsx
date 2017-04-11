import React from 'react'
import { bindActionCreators } from 'redux'
import { Provider, connect } from 'react-redux'
import { Socket } from 'socket.io'
import Layout from 'components/layout'

class Main extends React.Component {
  constructor (props) {
    super(props)

    let { player, socket, actions, createStore } = props

    this.store = createStore(player, socket)
    this.actions = bindActionCreators(actions, this.store.dispatch)

    let opponent = player === 1 ? 2 : 1

    socket.on('start', this.actions.start)
    socket.on('interrupt', this.actions.interrupt)
    socket.on('win', () => { this.actions.finish(player) })
    socket.on('lose', () => { this.actions.finish(opponent) })
    socket.on('draw', () => { this.actions.finish() })
    socket.on('move', (move) => { this.actions.move(opponent, move) })
    socket.on('message', (msg) => { this.actions.message(opponent, msg) })
    socket.on('signal', this.actions.receive)
  }

  // Changing props of this component makes no sense anyway,
  // so it's better to block its updates just in case.
  shouldComponentUpdate () { return false }

  render () {
    let App = connect((state) => state, (dispatch) => this.actions)(Layout)
    return (<Provider store={this.store}><App /></Provider>)
  }
}

Main.propTypes = {
  player: React.PropTypes.number.isRequired,
  socket: React.PropTypes.instanceOf(Socket).isRequired,
  actions: React.PropTypes.object.isRequired,
  createStore: React.PropTypes.func.isRequired
}

export default Main
