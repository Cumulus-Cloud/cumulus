import * as styles from "./ProgressBar.css"
import * as React from "react"

interface Props {
  className?: string
  progress: number
  indeterminate?: boolean
}

export default class ProgressBar extends React.PureComponent<Props> {
  render() {
    const { progress, indeterminate = false } = this.props
    return (
      <div className={styles.progressBar}>
        {indeterminate
          ? <div className={styles.indeterminate} />
          : <div className={styles.progress} style={{ width: `${progress}%` }} />
        }
      </div>
    )
  }
}
