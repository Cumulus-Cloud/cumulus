import * as React from "react"
import * as styles from "./BaseButton.css"
import classNames from "utils/ClassNames"

interface Props {
  disable?: boolean
  loading?: boolean
  className?: string
  onClick: () => void
  renderLoader: () => JSX.Element
}

export default class BaseButton extends React.PureComponent<Props> {
  render() {
    const { className, children, renderLoader, loading = false } = this.props
    const classes = classNames({
      [styles.baseButton]: true,
      [className || ""]: !!className,
    })
    return (
      <button className={classes} onClick={this.handleOnClick}>
        {loading
          ? renderLoader()
          : children
        }
      </button>
    )
  }

  handleOnClick = () => {
    const { onClick, disable = false, loading = false } = this.props
    if (!disable && !loading) {
      onClick()
    }
  }
}
