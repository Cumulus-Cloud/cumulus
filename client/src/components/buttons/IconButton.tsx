import * as React from "react"
import * as styles from "./IconButton.css"
import classNames from "utils/ClassNames"
import BaseButton from "components/buttons/BaseButton"

interface Props {
  title?: string
  loading?: boolean
  disable?: boolean
  onClick?(): void
  className?: string
}

export default class IconButton extends React.PureComponent<Props> {
  render() {
    const { className, children, title, loading = false, disable = false } = this.props
    const classes = classNames({
      [styles.iconButton]: true,
      [className || ""]: !!className,
    })
    return (
      <BaseButton title={title} className={classes} onClick={this.handleOnClick} loading={loading} disable={disable}>
        {children}
      </BaseButton>
    )
  }

  handleOnClick = () => {
    const { onClick } = this.props
    if (onClick) {
      onClick()
    }
  }
}
