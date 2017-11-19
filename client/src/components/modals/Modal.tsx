import * as React from "react"
import * as styles from "./Modal.css"

interface Props {
  title: string
  onClose: () => void
}

export default class Modal extends React.PureComponent<Props> {
  render() {
    const { title, children } = this.props
    return (
      <div className={styles.modal}>
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>
          {children}
        </div>
      </div>
    )
  }

  handleOnCancel = () => this.props.onClose()
}
