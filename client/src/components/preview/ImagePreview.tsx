import * as React from "react"
import * as styles from "./ImagePreview.css"

interface Props {
  src: string
}

export default class ImagePreview extends React.PureComponent<Props> {
  render() {
    const { src } = this.props
    return (
      <div>
        <img className={styles.imagePreview} src={src} />
      </div>
    )
  }
}
