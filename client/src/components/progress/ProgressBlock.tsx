import * as styles from "./ProgressBlock.css"
import * as React from "react"
import classNames from "utils/ClassNames"

interface Props {
  progress?: number
  indeterminate: boolean
  className?: string
}

export default class ProgressBlock extends React.PureComponent<Props> {
  render() {
    const { progress, indeterminate, children, className } = this.props
    const classes = classNames({
      [styles.progressBar]: true,
      [className || ""]: !!className
    })
    return (
      <div className={classes}>
        {indeterminate
          ? <div className={styles.indeterminate} />
          : <div className={styles.progress} style={{ width: `${progress}%` }} />
        }
        <div className={styles.content}>
          {children}
        </div>
      </div>
    )
  }
}
