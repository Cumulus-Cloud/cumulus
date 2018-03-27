import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
  className?: string
}

export default function ArrowUpIcon({ className, color = "#3DC7BE", width = 20, height = 20 }: Props) {
  return (
    <svg className={className} width={width} height={height} fill={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      <path d="M0 0h24v24H0z" fill="none"/>
    </svg>
  )
}
