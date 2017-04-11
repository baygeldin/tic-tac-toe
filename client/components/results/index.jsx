/* eslint-env browser */

import React from 'react'
import winSound from './win.wav'
import loseSound from './lose.wav'
import drawSound from './draw.wav'
import styles from './style.css'

class Results extends React.Component {
  constructor (props) {
    super(props)

    this.winSound = new Audio(winSound)
    this.loseSound = new Audio(loseSound)
    this.drawSound = new Audio(drawSound)
  }

  // Prevent playing sounds multiple times.
  shouldComponentUpdate () { return false }

  render () {
    let { result } = this.props
    let message

    switch (result) {
      case 'win':
        this.winSound.play()
        message = (
          <div className={styles.popup}>
            You did it! You won.
            <br />
            <b>Congratulations!</b> <i className='fa fa-thumbs-up' />
          </div>
        )
        break
      case 'lose':
        this.loseSound.play()
        message = (
          <div className={styles.popup}>
            <i>Oh, snap...</i> Okay, not this time.
            <br />
            <b>Better luck next time!</b> <i className='fa fa-hand-rock-o' />
          </div>
        )
        break
      case 'draw':
        this.drawSound.play()
        message = (
          <div className={styles.popup}>
            Well, it's a draw. Nothing much to say here.
            <br />
            <i>You can choose a winner in a fist fight tho.</i> <i className='fa fa-smile-o' />
          </div>
        )
        break
    }

    return (
      <div className={styles.wrap}>{message}</div>
    )
  }
}

Results.propTypes = {
  result: React.PropTypes.string.isRequired
}

export default Results
