import * as React from "react"
import * as styles from "./LinkButton.css"

interface Props {
  href?: string
  onClick?(): void
}

export default class LinkButton extends React.PureComponent<Props> {
  render() {
    const { children, href } = this.props
    return (
      <div className={styles.linkButton} onClick={this.handleOnClick}>
        {!!href
          ? <a className={styles.link} href={href}>{children}</a>
          : <div>{children}</div>
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
