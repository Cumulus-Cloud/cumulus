import * as React from "react"
import * as styles from "./FlatButton.css"
import LoaderIcon from "icons/LoaderIcon"
import BaseButton from "components/buttons/BaseButton"

export type FlatButtonType = "default" | "primary" | "accent" | "link"

interface Props {
  type?: FlatButtonType
  label: string
  loading?: boolean
  disable?: boolean
  onClick?: () => void
}

export default class FlatButton extends React.PureComponent<Props> {
  render() {
    const { label, onClick, loading = false, disable = false } = this.props
    return (
      <BaseButton className={styles.flatButton} disable={disable} loading={loading} renderLoader={() => <LoaderIcon />} onClick={onClick}>
        <div className={styles.label}>{label}</div>
      </BaseButton>
    )
  }
}
