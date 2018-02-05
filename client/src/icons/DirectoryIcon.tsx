import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
}

export default function DirectoryIcon({ color = "rgba(17, 22, 48, .9)", width = 30, height = 30 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 80" version="1.1">
      <g id="directory-icon" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="directory" transform="translate(0.000000, 10.000000)" fill={color}>
          <rect id="content" x="0" y="11.8032787" width="80" height="48.1967213" rx="1"></rect>
          <path
            // tslint:disable-next-line:max-line-length
            d="M0,1.00684547 C0,0.450780073 0.44782497,0 1.00283079,0 L24.1823544,0 C24.7362025,0 25.4209602,0.374466181 25.7233221,0.854688078 L34,14 L0,14 L0,1.00684547 Z"
          />
        </g>
        <rect id="container" x="0" y="0" width="80" height="80"></rect>
      </g>
    </svg>
  )
}
