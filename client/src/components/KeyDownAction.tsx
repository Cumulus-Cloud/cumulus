import * as React from "react"

interface Props {
  onKeyDown(event: KeyboardEvent): void
}

export default class KeyDownAction extends React.PureComponent<Props> {
  componentWillMount() {
    document.addEventListener("keydown", this.props.onKeyDown, false)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.props.onKeyDown, false)
  }

  render() {
    return (
      <>
        {this.props.children}
      </>
    )
  }
}
