import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
  className?: string
}

export default function NewFolderIcon({ className, color = "#3DC7BE", width = 30, height = 30 }: Props) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMax meet">
      <path d="M12.247 3H24a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h7.145a2 2 0 0 1 1.608.812L12 2.5c.115.155.196.325.247.5z" stroke={color} stroke-width="1.5" fill="#FFF" />
      <path d="M2 0h7.09a2 2 0 0 1 1.65.87c.624.91 1.09 1.535 1.398 1.878.398.443.968.776 1.708.998h-1.708H0V2a2 2 0 0 1 2-2z" fill={color} />
    </svg>
  )
}
