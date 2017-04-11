/* eslint-env browser */

import React from 'react'
import styles from './style.css'
import allowSound from './allow.wav'
import denySound from './deny.wav'
import cross from './cross.svg'
import nought from './nought.svg'

class Cell extends React.Component {
  constructor (props) {
    super(props)

    this.allowSound = new Audio(allowSound)
    this.denySound = new Audio(denySound)
    this.handleMove = this.handleMove.bind(this)
  }

  handleMove (event) {
    let { move, disabled } = this.props

    if (disabled) {
      this.denySound.play()
    } else {
      this.allowSound.play()
    }

    if (!disabled) move()
  }

  render () {
    let { id, value, disabled } = this.props

    return (
      <div onClick={this.handleMove} data-id={id} data-value={value} className={disabled ? styles.disabled : styles.enabled}>
        {value ? <img className={styles.image} src={value === 1 ? cross : nought} /> : null }
      </div>
    )
  }
}

Cell.propTypes = {
  id: React.PropTypes.string,
  move: React.PropTypes.func.isRequired,
  value: React.PropTypes.number.isRequired,
  disabled: React.PropTypes.bool.isRequired
}

export default Cell
