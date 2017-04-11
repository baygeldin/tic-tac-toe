/* eslint-env browser */

import React from 'react'
import ClipboardButton from 'react-clipboard.js'
import Config from 'components/config'
import Board from 'components/board'
import Results from 'components/results'
import Exception from 'components/exception'
import Chat from 'components/chat'
import Video from 'components/video'
import styles from './style.css'
import shared from 'components/shared/style.css'

class Layout extends React.Component {
  render () {
    let { move, message, configure, started, config, board,
      messages, next, player, winner, error, offer, signal } = this.props

    let body

    if (error) {
      body = <div className={styles.content}><Exception /></div>
    } else if (started) {
      let movePlayer = (x, y) => { move(player, { x, y }) }
      let messagePlayer = (msg) => { message(player, msg) }

      let results

      if (winner !== null) {
        results = <Results result={winner === 0 ? 'draw' : (winner === player ? 'win' : 'lose')} />
      }

      let video

      if (config.enableVideo) {
        video = <Video offer={offer} initiator={player === 1} signal={signal} />
      }

      body = (
        <div className={styles.content}>
          <div className={styles.game}>
            {results}
            <Board content={board} disabled={!!winner || next !== player} move={movePlayer} />
          </div>
          <div className={styles.sidebar}>
            {video}
            <Chat messages={messages} send={messagePlayer} />
          </div>
          <div className={shared.clear} />
        </div>
      )
    } else if (player === 1) {
      body = (
        <div className={styles.content}>
          <Config configure={configure} config={config} />
          <form className={shared.form}>
            <input value={location.href} readOnly />
            <ClipboardButton data-clipboard-text={location.href} button-className={shared.button}>
              <i className='fa fa-clipboard' />
            </ClipboardButton>
          </form>
        </div>
      )
    }

    return (
      <div className={styles.wrap}>
        <div className={styles.main}>
          <div className={styles.logo}>
            Tic-tac-toe!
          </div>
          {body}
        </div>
      </div>
    )
  }
}

Layout.propTypes = {
  move: React.PropTypes.func.isRequired,
  message: React.PropTypes.func.isRequired,
  configure: React.PropTypes.func.isRequired,
  offer: React.PropTypes.func.isRequired,
  started: React.PropTypes.bool.isRequired,
  config: React.PropTypes.shape({
    size: React.PropTypes.number.isRequired,
    line: React.PropTypes.number.isRequired,
    enableVideo: React.PropTypes.bool.isRequired
  }).isRequired,
  board: React.PropTypes.arrayOf(
    React.PropTypes.arrayOf(React.PropTypes.number)
  ).isRequired,
  messages: React.PropTypes.arrayOf(React.PropTypes.shape({
    player: React.PropTypes.number.isRequired,
    text: React.PropTypes.string.isRequired
  })).isRequired,
  next: React.PropTypes.number.isRequired,
  player: React.PropTypes.number.isRequired,
  error: React.PropTypes.bool.isRequired,
  winner: React.PropTypes.number,
  signal: React.PropTypes.object
}

export default Layout
