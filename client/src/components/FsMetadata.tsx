import * as React from "react"
import * as styles from "./FsMetadata.css"

interface Props {
  label: string
  value: string
}

export default class FsMetadata extends React.PureComponent<Props> {
  render() {
    const { label, value } = this.props
    return (
      <div className={styles.fsMetadata}>
        <label className={styles.label}>{label}</label>
        <div className={styles.value}>{value}</div>
      </div>
    )
  }
}
