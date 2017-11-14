import * as React from "react"
import * as styles from "./Modal.css"
import FlatButton from "components/buttons/FlatButton"

interface Props {
  title: string
  onClose: () => void
  onSubmit: () => void
}

export default class Modal extends React.PureComponent<Props> {
  render() {
    const { title, children } = this.props
    return (
      <div className={styles.modal}>
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>
          {children}
          <div className={styles.actions}>
            <FlatButton label="Cancel" onClick={this.handleOnCancel} />
            <FlatButton label={"Créer"} onClick={this.handleOnSubmit} />
          </div>
        </div>
      </div>
    )
  }

  handleOnCancel = () => this.props.onClose()
  handleOnSubmit = () => this.props.onSubmit()
}
