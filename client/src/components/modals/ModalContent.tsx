import * as React from "react"
import * as styles from "./ModalContent.css"

interface Props {
  children: React.ReactNode
}

export default function ModalContent(props: Props) {
  const { children } = props
  return (
    <div className={styles.modalContent}>
      {children}
    </div>
  )
}
