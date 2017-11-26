import * as React from "react"
import * as styles from "./Empty.css"

export default function Empty(props: {}): JSX.Element {
  return (
    <div className={styles.empty}>
      <h3 className={styles.title}>Empty</h3>
    </div>
  )
}
