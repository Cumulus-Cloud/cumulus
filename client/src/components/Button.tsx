import * as React from "react"
import "./button.css"

interface Props {
  onClick: (event: any) => void
  children?: any
  loading?: boolean
}

export default function Button({ onClick, children, loading }: Props) {
  return (
    <div className="btn" onClick={!!loading ? undefined : onClick}>
      {!!loading ? "Loadng" : children}
    </div>
  )
}
