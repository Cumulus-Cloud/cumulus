import React from 'react'
import { ComponentType } from 'react'

import { Difference } from 'utils/types'


export type DraggingInfo<T> = {
  x: number
  y: number
  value: T
}

type DraggableProps<T> = {
  onDrag: () => T
  children?: React.ReactNode
}

type DropZoneProps<T> = {
  onDrop: (dropped: T) => void
  onDragOver?: (dragged: T) => void
  children?: React.ReactNode
}

type DragAndDropProps<T> = {
  renderDraggedElement: (dragInfo: DraggingInfo<T>) => React.ReactNode
  children: (
    Draggable: React.SFC<DraggableProps<T>>,
    DropZone: React.SFC<DropZoneProps<T>>,
    dragInfo?: DraggingInfo<T>
  ) => React.ReactNode
}

type State<T> = {
  dragInfo?: DraggingInfo<T>
}

/**
 * Generic drag & drop component. Note: this composant does not use the HTML drag & drop API (because of performance issues)
 * but rather rely on the mouse events (mouseup and mousemove) to mimic its behavior.
 */
export class DragAndDrop<T> extends React.Component<DragAndDropProps<T>, State<T>> {

  state: State<T> = {}

  componentDidMount() {
    document.addEventListener('mousemove', this.dragHandler)
    document.addEventListener('mouseup', () => this.dragEndHandler)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.dragHandler)
    document.removeEventListener('mouseup', () => this.dragEndHandler)
  }

  dragEndHandler = (_: MouseEvent) => {
    const { dragInfo } = this.state

    if(dragInfo) 
      this.setState({ dragInfo: undefined })
  }

  dragHandler = (e: MouseEvent) => {
    const { dragInfo } = this.state

    e.preventDefault()

    if(dragInfo) {
      this.setState({
        dragInfo: {
          ...dragInfo,
          x: e.clientX,
          y: e.clientY
        }
      })
    }
  }

  draggable = (props: DraggableProps<T>) => (
    <div
      onMouseDown={e => {
        this.setState({
          dragInfo: {
            value: props.onDrag(),
            x: e.nativeEvent.clientX,
            y: e.nativeEvent.clientY
          }
        })
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      {props.children}
    </div>
  )

  dropZone = (props: DropZoneProps<T>) => (
    <div
      onMouseUp={e => {
        const { dragInfo } = this.state

        if(dragInfo) {
          props.onDrop(dragInfo.value)
          this.setState({ dragInfo: undefined })
          e.stopPropagation()
          e.preventDefault()
        }
      }}

      onMouseOver={_ => {
        const { dragInfo } = this.state
        const { onDragOver } = props

        if(dragInfo && onDragOver)
          onDragOver(dragInfo.value)

      }}
    >
      {props.children}
    </div>
  )

  render() {
    const { dragInfo } = this.state
    const { children, renderDraggedElement } = this.props

    return (
      <>
      { children(this.draggable, this.dropZone, dragInfo) }
      { dragInfo && renderDraggedElement(dragInfo) }
      </>
    )
  }

}

/**
 * Injected props. 
 */
export type WithDragAndDrop<T> = {
  /** Draggable container. */
  Draggable: React.SFC<DraggableProps<T>>,
  /** Drop zone (for a draggable container). */
  DropZone: React.SFC<DropZoneProps<T>>,
  /** If a dragging is in progress, the dragging information. */
  dragInfo?: DraggingInfo<T>
}

/**
 * High order component allowing to inject the drag & drop informations into the props. The props of
 * the component must be composed with the type WithDragAndDrop.
 */
export const withDragAndDrop = <PROPS extends WithDragAndDrop<T>, T, S>(
  Component: ComponentType<PROPS>,
  renderDraggedElement: (dragInfo: DraggingInfo<T>) => React.ReactNode
): ComponentType<Difference<PROPS, WithDragAndDrop<T>>> => {

  return class extends React.Component<Difference<PROPS, WithDragAndDrop<T>>, S> {
    
    render() {
      return (
        <DragAndDrop<T> renderDraggedElement={ (props) => renderDraggedElement(props) } >
          { (Draggable, DropZone, dragInfo) =>
              <Component Draggable={ Draggable } DropZone={ DropZone } dragInfo={ dragInfo } {...this.props} />
          }
        </DragAndDrop>
      )
    }

  } 

}
