import * as React from "react"
import * as styles from "./VideoPlayer.css"

interface Props {
  src: string
}

export default class VideoPlayer extends React.PureComponent<Props> {
  render() {
    const { src } = this.props
    return (
      <div>
        <video className={styles.videoPlayer} controls src={src} />
      </div>
    )
  }
}
