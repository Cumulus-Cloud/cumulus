import * as React from "react"
import * as styles from "./BaseButton.css"
import classNames from "utils/ClassNames"

interface Props {
  disable?: boolean
  loading?: boolean
  className?: string
  matchParent?: boolean
  onClick?(): void
  href?: string
  renderLoader(): JSX.Element
}

export default class BaseButton extends React.PureComponent<Props> {
  render() {
    const { className, href, matchParent = false } = this.props
    const classes = classNames({
      [styles.baseButton]: true,
      [styles.matchParent]: matchParent,
      [className || ""]: !!className,
    })
    if (href) {
      return <a href={href} className={classes} onClick={this.handleOnClick}>{this.renderContent()}</a>
    } else {
      return <button role="button" className={classes} onClick={this.handleOnClick}>{this.renderContent()}</button>
    }
  }

  renderContent = () => {
    const { children, renderLoader, loading = false } = this.props
    if (loading) {
      return renderLoader()
    } else {
      return children
    }
  }

  handleOnClick = () => {
    const { onClick, disable = false, loading = false } = this.props
    if (!disable && !loading && onClick) {
      onClick()
    }
  }
}
