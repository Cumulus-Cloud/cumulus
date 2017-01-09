import "./raisedButton.css"
import * as React from "react"

type RaisedButton = "default" | "danger"

interface Props {
  children?: JSX.Element
  type?: RaisedButton
  onClick: () => void
}

export default function RaisedButton({ children, type = "default", onClick }: Props) {
  return (
    <button className={`raised-button raised-button-${type}`} onClick={onClick}>
      {children}
    </button>
  )
}
