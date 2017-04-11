import React from 'react'
import styles from './style.css'

const MIN_SIZE = 3
const MIN_LINE = 3
const MAX_SIZE = 10
const MAX_LINE = 5

class Config extends React.Component {
  render () {
    let { configure, config } = this.props

    let boardSizes = []
    let lineSizes = []

    for (let i = MIN_SIZE; i <= MAX_SIZE; i++) {
      boardSizes.push(<option key={i} value={i}>{i}</option>)
    }

    for (let i = MIN_LINE; i <= MAX_LINE; i++) {
      lineSizes.push(<option key={i} value={i}>{i}</option>)
    }

    let toggleVideo = (e) => { configure({ enableVideo: e.target.checked }) }
    let changeSize = (e) => { configure({ size: parseInt(e.target.value) }) }
    let changeLine = (e) => {
      let line = parseInt(e.target.value)
      // Size cannot be less than size
      // (it is checked on the server side as well).
      configure({ size: Math.max(config.size, line), line })
    }

    return (
      <form className='pure-form'>
        <fieldset>
          <label htmlFor='size'>Board Size</label>
          <select id='size' className={styles.select} onChange={changeSize} value={config.size}>
            {boardSizes}
          </select>
          <label htmlFor='line'>Line Size</label>
          <select id='line' className={styles.select} onChange={changeLine} value={config.line}>
            {lineSizes}
          </select>
          <label htmlFor='video'>
            <input id='video' type='checkbox' className={styles.checkbox}
              onChange={toggleVideo} checked={config.enableVideo} /> Video Chat
          </label>
        </fieldset>
      </form>
    )
  }
}

Config.propTypes = {
  configure: React.PropTypes.func.isRequired,
  config: React.PropTypes.shape({
    size: React.PropTypes.number.isRequired,
    line: React.PropTypes.number.isRequired,
    enableVideo: React.PropTypes.bool.isRequired
  }).isRequired
}

export default Config
