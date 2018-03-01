import * as React from "react"
import * as styles from "./AuthLayout.css"
import InAppNotifContainer from "inAppNotif/InAppNotifContainer"

export default class AuthLayout extends React.PureComponent<{}> {
  render() {
    const { children } = this.props
    return (
      <div className={styles.authPage}>
        <InAppNotifContainer />
        <div className={styles.authContainer}>
          <h1 className={styles.title}>{Messages("ui.appName")}</h1>
          <h2 className={styles.baseline}>{Messages("ui.baseline")}</h2>
          {children}
        </div>
      </div>
    )
  }
}
