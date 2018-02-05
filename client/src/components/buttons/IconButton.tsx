import * as React from "react"
import * as styles from "./IconButton.css"
import LoaderIcon from "icons/LoaderIcon"
import classNames from "utils/ClassNames"

interface Props {
  loading?: boolean
  onClick?(): void
  className?: string
}

export default class IconButton extends React.PureComponent<Props> {
  render() {
    const { className, children, loading = false } = this.props
    const classes = classNames({
      [styles.iconButton]: true,
      [className || ""]: !!className,
    })
    return (
      <div className={classes} onClick={this.handleOnClick}>
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
