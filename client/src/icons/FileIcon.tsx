import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
}

export default function FileIcon({ color = "#D8D8D8", width = 30, height = 30 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 80" version="1.1">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(10.000000, 0.000000)">
          <path
            // tslint:disable-next-line:max-line-length
            d="M0,0.997014809 C0,0.446378735 0.457694575,0 1.00742556,0 L39.7472914,0 C40.3036772,0 41.0648094,0.322252922 41.4510365,0.723626129 L59.3036805,19.2763739 C59.6882471,19.6760215 60,20.4484582 60,20.9913525 L60,79.0086475 C60,79.5561564 59.5515418,80 59.0086475,80 L0.991352499,80 C0.443843632,80 0,79.550093 0,79.0029852 L0,0.997014809 Z"
            fill={color}
          />
          <path
            // tslint:disable-next-line:max-line-length
            d="M39.6226415,3 L57,20 L40.632033,20 C40.0745615,20 39.6226415,19.5452911 39.6226415,19.0000398 L39.6226415,3 Z"
            fill="#FFFFFF"
          />
        </g>
        <rect x="0" y="0" width="80" height="80"></rect>
      </g>
    </svg>
  )
}
