import React, { ComponentType } from 'react'

import { Difference } from 'utils/types'


export type DraggingInfo<T> = {
  x: number
  y: number
  offsetX: number
  offsetY: number
  distanceX: number
  distanceY: number
  value: T
}

type DraggableProps<T> = {
  onDrag: () => T
  children?: React.ReactNode
}

type DropZoneProps<T> = {
  onDrop: (dropped: T, e: React.MouseEvent<HTMLElement>) => void
  onDragOver?: (dragged: T, e: React.MouseEvent<HTMLElement>) => void
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
  nextDrag?: () => T
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
    document.addEventListener('mouseup', this.dragEndHandler)
    document.addEventListener('contextmenu', this.dragEndHandler)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.dragHandler)
    document.removeEventListener('mouseup', this.dragEndHandler)
    document.removeEventListener('contextmenu', this.dragEndHandler)
    document.body.style.cursor = null
  }

  dragEndHandler = (_: MouseEvent) => {
    const { dragInfo } = this.state

    if(dragInfo) // Reset everything when the mouse is released
      this.reset()
  }

  dragHandler = (e: MouseEvent) => {
    const { dragInfo, nextDrag } = this.state

    e.preventDefault()

    if (dragInfo) {
      // Update the drag info with the new position
      this.setState({
        dragInfo: {
          ...dragInfo,
          x: e.clientX,
          y: e.clientY,
          distanceX: dragInfo.distanceX + (e.clientX > dragInfo.x ? e.clientX - dragInfo.x : dragInfo.x - e.clientX),
          distanceY: dragInfo.distanceY + (e.clientY > dragInfo.y ? e.clientY - dragInfo.y : dragInfo.y - e.clientY)
        }
      })
    } else if (nextDrag) {
      // Start the draggind mode by firing the saved drag event
      // and setting our drag info
      document.body.style.cursor = 'grab'

      this.setState({
        nextDrag: undefined,
        dragInfo: {
          value: nextDrag(),
          x: e.clientX,
          y: e.clientY,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          distanceX: 0,
          distanceY: 0
        }
      })
    }
  }

  reset() {
    this.setState({ nextDrag: undefined, dragInfo: undefined })
    document.body.style.cursor = null
  }

  draggable = (props: DraggableProps<T>) => (
    <div
      onMouseDown={e => {
        e.stopPropagation()
        e.preventDefault()

        // We don't want to fire the drag event right now, and we at least wait
        // for a next event to be fired
        this.setState({
          nextDrag: () => props.onDrag()
        })
      }}
    >
      {props.children}
    </div>
  )

  dropZone = (props: DropZoneProps<T>) => (
    <div
      onMouseUp={e => {
        e.stopPropagation()
        e.preventDefault()

        const { dragInfo } = this.state

        if (dragInfo)
          props.onDrop(dragInfo.value, e)

        this.reset()
      }}

      onMouseOver={e => {
        const { dragInfo } = this.state
        const { onDragOver } = props

        if(dragInfo && onDragOver)
          onDragOver(dragInfo.value, e)
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

export function dragAndDropProps<T, P extends WithDragAndDrop<T>>(props: P): WithDragAndDrop<T> {
  const { Draggable, DropZone, dragInfo } = props
  return { Draggable, DropZone, dragInfo }
}

export function dragAndDropPropsOpt<T, P extends Partial<WithDragAndDrop<T>>>(props: P): Partial<WithDragAndDrop<T>> {
  const { Draggable, DropZone, dragInfo } = props
  return { Draggable, DropZone, dragInfo }
}

/**
 * High order component allowing to inject the drag & drop informations into the props. The props of
 * the component must be composed with the type WithDragAndDrop.
 */
export const withDragAndDrop = <PROPS extends WithDragAndDrop<T>, T, S>(
  Component: ComponentType<PROPS>,
  renderDraggedElement: (dragInfo: DraggingInfo<T>) => React.ReactNode
): ComponentType<Difference<PROPS, WithDragAndDrop<T>>> => {

  const ComponentFix = Component as ComponentType<any> // TODO remove when React is fixed

  return class extends React.Component<Difference<PROPS, WithDragAndDrop<T>>, S> {

    render() {
      return (
        <DragAndDrop<T> renderDraggedElement={ (props) => renderDraggedElement(props) } >
          { (Draggable, DropZone, dragInfo) =>
              <ComponentFix Draggable={ Draggable } DropZone={ DropZone } dragInfo={ dragInfo } {...this.props} />
          }
        </DragAndDrop>
      )
    }

  }

}
