import * as React from "react"

interface Props {
  color?: string
  width?: number
  height?: number
}

export default class AddIcon extends React.PureComponent<Props> {
  render() {
    const { color = "#000000", width = 20, height = 20 } = this.props
    return (
      <svg fill={color} width={width} height={height} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
      </svg>
    )
  }
}
