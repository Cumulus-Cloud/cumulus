import * as React from "react"
import * as styles from "./FileIcon.css"

interface Props {
  extention: string
}

export default function FileIcon({ extention }: Props) {
  return (
    <div className={styles.fileIcon}>
      <div className={styles.fileIconText}>{extention}</div>
    </div>
  )
}
