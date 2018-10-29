import  React from 'react'

interface Props {
  className?: string
  onDragStart?: () => void
  onDragEnter?: () => void
  onDragOver?: () => void
  onDragLeave?: () => void
  onDrop: (files: File[]) => void
}

/**
 * Simple wrapper to handle a dropzone for files. This dropzone allow to easily bind to
 * common drag & drop wrapper, and will call provided callback only when a file is dragged. 
 */
export default class FileDropzone extends React.Component<Props, {}> {

  dragTargets: EventTarget[] = []

  getFileList(e: React.DragEvent<HTMLDivElement>) {
    return [...e.dataTransfer.files]
  }

  isFileDragging(e: React.DragEvent<HTMLDivElement>) {
    return [...e.dataTransfer.types].indexOf('Files') >= 0
  }

  onDragStart(e: React.DragEvent<HTMLDivElement>) {
    const { onDragStart } = this.props

    if(onDragStart && this.isFileDragging(e))
      onDragStart()
  }

  onDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const { onDragEnter } = this.props

    if (this.dragTargets.indexOf(e.target) === -1) {
      this.dragTargets.push(e.target)
    }

    if(onDragEnter && this.isFileDragging(e))
      onDragEnter()
  }

  onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const { onDragOver } = this.props

    if(onDragOver && this.isFileDragging(e))
      onDragOver()
  }
  
  onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    
    const { onDragLeave } = this.props

    this.dragTargets = this.dragTargets.filter(target => target !== e.target) // && this.node.contains(el))

    if(this.dragTargets.length == 0 && onDragLeave && this.isFileDragging(e))
      onDragLeave()
  }

  onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const files = this.getFileList(e)
    const { onDrop } = this.props

    if(onDrop && files.length > 0)
      onDrop(files)
  }

  render() {
    const { children, className } = this.props

    return (
      <div
        className={className}
        onDragStart={ (e) => this.onDragStart(e) }
        onDragEnter={ (e) => this.onDragEnter(e) }
        onDragOver={ (e) => this.onDragOver(e) }
        onDragLeave={ (e) => this.onDragLeave(e) }
        onDrop={ (e) => this.onDrop(e) }
      >
        { children }
      </div>
    )
  }

}
