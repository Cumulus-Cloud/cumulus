import * as React from "react"
import * as styles from "./FlatButton.css"
import LoaderIcon from "icons/LoaderIcon"

export type FlatButtonType = "default" | "primary" | "accent" | "link"

interface Props {
  type?: FlatButtonType
  label: string
  loading?: boolean
  onClick?(): void
}

export default class FlatButton extends React.PureComponent<Props> {
  render() {
    const { label, loading = false } = this.props
    return (
      <button className={styles.flatButton} onClick={this.handleOnClick}>
        {loading
          ? <LoaderIcon />
          : <div>{label}</div>
        }
      </button>
    )
  }

  handleOnClick = () => {
    const { onClick, loading } = this.props
    if (onClick && loading !== true) {
      onClick()
    }
  }
}
