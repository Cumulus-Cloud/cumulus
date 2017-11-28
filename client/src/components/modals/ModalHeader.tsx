import * as React from "react"
import * as styles from "./ModalHeader.css"

interface Props {
  title: string
}

export default function ModalHeader(props: Props) {
  const { title } = props
  return (
    <div className={styles.modalHeader}>
      <h1 className={styles.title}>{title}</h1>
    </div>
  )
}
