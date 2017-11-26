import * as React from "react"
import * as styles from "./IconButton.css"
import LoaderIcon from "components/icons/LoaderIcon"

interface Props {
  loading?: boolean
  onClick?: () => void
}

export default class IconButton extends React.PureComponent<Props> {
  render() {
    const { loading = false, children } = this.props
    return (
      <div className={styles.iconButton} onClick={this.handleOnClick}>
        {loading
          ? <LoaderIcon />
          : children
        }
      </div>
    )
  }

  handleOnClick = () => {
    const { onClick } = this.props
    if (onClick) {
      onClick()
    }
  }
}
