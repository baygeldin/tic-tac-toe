import React from 'react'
import styles from './styles.css'

class Exception extends React.Component {
  render () {
    return (
      <div className={styles.error}>
        <i>Oops!</i> Seems like your opponent has disconnected.
        <br />
        Do you want to <a href='/'>start a new game</a>?
      </div>
    )
  }
}

export default Exception
