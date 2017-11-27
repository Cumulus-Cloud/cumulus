import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
}

export default function MoreHorizIcon({ color = "#303f9f", width = 24, height = 24 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={color} version="1.1" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  )
}
