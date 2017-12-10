import * as React from "react"
import * as styles from "./LeftPanel.css"
import classNames from "utils/ClassNames"

export default class LeftPanel extends React.PureComponent<{}> {
  render() {
    const activeStyle = classNames({
      [styles.link]: true,
      [styles.active]: true,
    })
    return (
      <div className={styles.leftPanel}>
        <div className={styles.appTitle}>
          {Messages("ui.appName")}
        </div>
        <ul className={styles.links}>
          <li className={activeStyle}>My Server</li>
          <li className={styles.link}>Other Servers</li>
          <li className={styles.link}>Shared with me</li>
          <li className={styles.link}>Recent</li>
          <li className={styles.link}>Favorites</li>
          <li className={styles.link}>Trashed</li>
        </ul>
      </div>
    )
  }
}
