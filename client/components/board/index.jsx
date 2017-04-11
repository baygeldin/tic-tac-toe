import React from 'react'
import Cell from 'components/cell'
import styles from './style.css'

class Board extends React.Component {
  render () {
    let { move, content, disabled } = this.props

    let rows = content.map((r, x) => (
      <div key={x} className={styles.row}>
        {
          r.map((c, y) => {
            let moveCell = () => { move(x, y) }
            return <Cell key={y} value={c} id={`${x}-${y}`}
              disabled={disabled || !!c} move={moveCell} />
          })
        }
      </div>
    ))

    return (
      <div className={styles.wrap}>{rows}</div>
    )
  }
}

Board.propTypes = {
  move: React.PropTypes.func.isRequired,
  content: React.PropTypes.arrayOf(
    React.PropTypes.arrayOf(React.PropTypes.number)
  ).isRequired,
  disabled: React.PropTypes.bool.isRequired
}

export default Board
