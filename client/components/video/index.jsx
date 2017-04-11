import React from 'react'
import Peer from 'simple-peer'
import filler from './filler.png'
import styles from './style.css'

class Video extends React.Component {
  componentWillReceiveProps (nextProps) {
    let data = nextProps.signal

    if (data && data !== this.props.signal) {
      this.peer.signal(data)
    }
  }

  shouldComponentUpdate () { return false }

  componentDidMount () {
    let { offer, initiator } = this.props

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Helps to stub getUserMedia API.
        if (!stream) return
        this.stream = stream
        this.peer = new Peer({ initiator, stream, trickle: false })
        this.peer.on('error', (e) => { console.error(e) })
        this.peer.on('signal', offer)
        this.peer.on('stream', (stream) => {
          this.video.src = window.URL.createObjectURL(stream)
          this.video.play()
        })
      }).catch((err) => { throw err })
  }

  componentWillUnmount () {
    if (!this.stream) return
    let stream = this.stream.getVideoTracks()[0]
    if (stream && stream.stop) stream.stop()
  }

  render () {
    return (
      <video className={styles.video} poster={filler}
        ref={(video) => { this.video = video }} />
    )
  }
}

Video.propTypes = {
  offer: React.PropTypes.func.isRequired,
  initiator: React.PropTypes.bool.isRequired,
  signal: React.PropTypes.object
}

export default Video
