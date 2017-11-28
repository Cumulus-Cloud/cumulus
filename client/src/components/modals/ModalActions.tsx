import * as React from "react"
import * as styles from "./ModalActions.css"

export default function ModalActions(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <div className={styles.modalActions}>
      {children}
    </div>
  )
}
