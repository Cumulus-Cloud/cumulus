import * as React from "react"
import * as styles from "./BaseButton.css"
import classNames from "utils/ClassNames"
import LoaderIcon from "icons/LoaderIcon"

interface Props {
  title?: string
  disable?: boolean
  loading?: boolean
  className?: string
  matchParent?: boolean
  onClick?(): void
  href?: string
  renderLoader?(): JSX.Element
}

export default class BaseButton extends React.PureComponent<Props> {
  render() {
    const { className, href, title, matchParent = false } = this.props
    const classes = classNames({
      [styles.baseButton]: true,
      [styles.matchParent]: matchParent,
      [className || ""]: !!className,
    })
    if (href) {
      return <a title={title} href={href} className={classes} onClick={this.handleOnClick}>{this.renderContent()}</a>
    } else {
      return <button role="button" title={title} className={classes} onClick={this.handleOnClick}>{this.renderContent()}</button>
    }
  }

  renderContent = () => {
    const { children, renderLoader, loading = false } = this.props
    if (loading && !!renderLoader) {
      return renderLoader()
    } else if (loading) {
      return this.renderDefaultLoader()
    } else {
      return children
    }
  }

  renderDefaultLoader = () => <LoaderIcon />

  handleOnClick = () => {
    const { onClick, disable = false, loading = false } = this.props
    if (!disable && !loading && onClick) {
      onClick()
    }
  }
}
