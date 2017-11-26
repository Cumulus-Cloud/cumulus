import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
}

export default function ArrowRightIcon({ color = "#303f9f", width = 24, height = 24 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={color} version="1.1" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
      <path d="M0-.25h24v24H0z" fill="none" />
    </svg>
  )
}
