import * as React from "react"
import * as styles from "./ModalActions.css"

export default class ModalActions extends React.PureComponent<{}> {
  render() {
    const { children } = this.props
    return (
      <div className={styles.modalActions}>
        {children}
      </div>
    )
  }
}
