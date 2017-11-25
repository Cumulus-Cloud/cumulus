import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
}

export default function FileDownloadIcon({ color = "#D8D8D8", width = 24, height = 24 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </svg>
  )
}
