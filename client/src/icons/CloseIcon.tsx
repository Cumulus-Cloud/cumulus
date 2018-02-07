import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
}

export default function CloseIcon({ color = "#6F6F6F", width = 20, height = 20 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <path fill="none" stroke="#979797" strokeLinecap="square" strokeWidth="2" d="M2 2l17 17M2 19L19 2"/>
    </svg>
  )
}
