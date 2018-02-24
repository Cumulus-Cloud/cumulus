import * as React from "react"
import * as styles from "./TargetDirectory.css"
import { FsDirectory } from "models/FsNode"

interface Props {
  target: FsDirectory
  onClick(): void
}

export default function TargetDirectory({ target, onClick }: Props) {
  return (
    <div className={styles.targetDirectory} onClick={onClick}>
      <div className={styles.label}>{target.name}</div>
    </div>
  )
}
