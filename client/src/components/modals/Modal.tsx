import * as React from "react"
import * as styles from "./Modal.css"

interface Props {
  onClose(): void
}

export default class Modal extends React.PureComponent<Props> {
  render() {
    const { children } = this.props
    return (
      <div className={styles.modal}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    )
  }

  handleOnCancel = () => this.props.onClose()
}
