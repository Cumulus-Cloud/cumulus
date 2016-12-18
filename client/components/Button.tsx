import * as React from "react"
import "./button.css"

interface Props {
  onClick: (event: any) => void
  children?: any
}

export default function Button({ onClick, children }: Props) {
  return (
    <div className="btn" onClick={onClick}>
      {children}
    </div>
  )
}
