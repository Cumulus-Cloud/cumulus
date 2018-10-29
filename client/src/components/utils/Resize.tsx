import  React from 'react'


export type ResizeProps = {
  children: (props: { height: number, width: number }) => React.ReactNode
} & React.HTMLProps<HTMLDivElement>

export default class Resize extends React.Component<ResizeProps, { height: number, width: number}> {

  state = { height: 0, width: 0 }

  div: HTMLDivElement | null = null

  componentDidMount() {
    this.updateSize()
    window.addEventListener('resize', this.updateSize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize)
  }

  componentDidUpdate() {
    this.updateSize()
  }

  updateSize = () => {
    if (this.div && ((this.state.height != this.div.clientHeight) || (this.state.width != this.div.clientWidth)))
      this.setState({ height: this.div.clientHeight, width: this.div.clientWidth })
  }

 render() {
    const { height, width } = this.state

    return (
      <div {...this.props} ref={div => { this.div = div } }>
        {this.props.children({ height, width })}
      </div>
    )
  }

}