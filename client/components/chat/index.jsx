import React from 'react'
import ReactDOM from 'react-dom'
import styles from './style.css'
import shared from 'components/shared/style.css'

class Chat extends React.Component {
  constructor (props) {
    super(props)

    this.state = { input: '' }
    this.onInput = this.onInput.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onInput (event) {
    this.setState({ input: event.target.value })
  }

  onSubmit (event) {
    event.preventDefault()
    if (this.state.input) this.props.send(this.state.input)
  }

  render () {
    let { messages } = this.props

    let messagesViews = messages.map((m, id) => (
      <div key={id} data-player={m.player} className={styles.message}>
        <i className={`fa fa-${m.player === 1 ? 'times' : 'circle-o'} ${styles.player}`} />
        {m.text}
        <div className={shared.clear} />
      </div>
    ))

    return (
      <div className={styles.wrap}>
        <div className={styles.list}>
          {messagesViews}
          <div className={styles.dummy}
            ref={(el) => { this.bottom = el }} />
        </div>
        <form className={shared.form} onSubmit={this.onSubmit}>
          <input placeholder='Got something to say?' size={2}
            value={this.state.input} onChange={this.onInput} />
          <button type='submit' className={shared.button}>
            <i className='fa fa-paper-plane' />
          </button>
        </form>
      </div>
    )
  }

  componentDidUpdate () {
    if (this.bottom) {
      let node = ReactDOM.findDOMNode(this.bottom)
      node.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

Chat.propTypes = {
  messages: React.PropTypes.arrayOf(React.PropTypes.shape({
    player: React.PropTypes.number.isRequired,
    text: React.PropTypes.string.isRequired
  })).isRequired,
  send: React.PropTypes.func.isRequired
}

export default Chat
