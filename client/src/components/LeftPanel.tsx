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
        <ul className={styles.menu}>
          <li className={styles.menuitem}>
            <a className={activeStyle} href="#/fs/">{Messages("ui.myserver")}</a>
          </li>
          {/* <li className={styles.menuitem}><a className={styles.link}>Other Servers</a></li>
          <li className={styles.menuitem}><a className={styles.link}>Shared with me</a></li>
          <li className={styles.menuitem}><a className={styles.link}>Recent</a></li>
          <li className={styles.menuitem}><a className={styles.link}>Favorites</a></li>
          <li className={styles.menuitem}><a className={styles.link}>Trashed</a></li> */}
        </ul>
      </div>
    )
  }
}
