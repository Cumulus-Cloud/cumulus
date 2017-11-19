import * as React from "react"
import * as styles from "./AppBar.css"

interface Props {

}

export default class AppBar extends React.PureComponent<Props> {
  render() {
    return (
      <div className={styles.appBar}>
        <div className={styles.appTitle}>Cumulus</div>
      </div>
    )
  }
}
