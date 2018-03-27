import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
  className?: string
}

export default function UploadIcon({ className, color = "#3DC7BE", width = 20, height = 20 }: Props) {
  return (
    <svg className={className} width={width} height={height} fill={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
    </svg>
  )
}
