import * as React from "react"
import * as styles from "./FlatButton.css"
import BaseButton from "components/buttons/BaseButton"

export type FlatButtonType = "default" | "primary" | "accent" | "link"

interface Props {
  type?: FlatButtonType
  label: string
  loading?: boolean
  onClick?(): void
  disable?: boolean
}

export default class FlatButton extends React.PureComponent<Props> {
  render() {
    const { label, onClick, loading = false, disable = false } = this.props
    return (
      <BaseButton className={styles.flatButton} disable={disable} loading={loading} onClick={onClick}>
        <div className={styles.label}>{label}</div>
      </BaseButton>
    )
  }
}
