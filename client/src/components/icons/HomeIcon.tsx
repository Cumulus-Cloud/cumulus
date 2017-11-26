import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
}

export default function HomeIcon({ color = "#303f9f", width = 24, height = 24 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={color} version="1.1" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </svg>
  )
}
