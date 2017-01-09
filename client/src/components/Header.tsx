import "./header.css"
import * as React from "react"

interface Props {
  title: string
}

export default function Header({ title }: Props) {
  return (
    <div className="header">
      <a className="header-title" href="/">
        {title}
      </a>
    </div>
  )
}
