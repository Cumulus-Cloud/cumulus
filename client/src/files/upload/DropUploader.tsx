import * as React from "react"
import { DropTarget, DropTargetMonitor, DropTargetConnector, ConnectDropTarget } from "react-dnd"
import { NativeTypes } from "react-dnd-html5-backend"
import { FileToUpload, fromFileList } from "models/FileToUpload"
import { FsDirectory } from "models/FsNode"

interface OwnProps {
  className?: string
  directory: FsDirectory
  onAddFilesToUpload(files: FileToUpload[]): void
}

interface DropProps {
  connectDropTarget: ConnectDropTarget
  isOver: boolean
  canDrop: boolean
}

type Props = OwnProps & DropProps

const boxTarget = {
  drop(props: Props, monitor: DropTargetMonitor) {
    // tslint:disable-next-line:no-any
    const files: FileList = (monitor.getItem() as any).files
    props.onAddFilesToUpload(fromFileList(files, props.directory))
  },
}

const collect = (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
})

class DropUploader extends React.PureComponent<Props> {
  render() {
    const { children, className, connectDropTarget } = this.props
    return connectDropTarget(
      <div className={className}>
        {children}
      </div>
    )
  }
}

export default DropTarget<OwnProps>(NativeTypes.FILE, boxTarget, collect)(DropUploader)
