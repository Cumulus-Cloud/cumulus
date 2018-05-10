import * as React from "react"
import { DragDropContext, DragDropContextProvider } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import DropUploader from "files/upload/DropUploader"
import { FileToUpload } from "models/FileToUpload"
import { Dispatch, connect } from "react-redux"
import { GlobalState } from "store"
import { UploadActions } from "files/upload/UploadActions"
import { FsDirectory } from "models/FsNode"
import { Actions } from "actions"

interface OwnProps {
  className?: string
}

interface DispatchProps {
  onAddFilesToUpload(files: FileToUpload[]): void
}

interface PropsState {
  directory: FsDirectory
}

type Props = PropsState & OwnProps & DispatchProps

class DropUploaderContainer extends React.PureComponent<Props> {
  render() {
    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <DropUploader {...this.props} />
      </DragDropContextProvider>
    )
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    directory: state.fileSystem.directory!,
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Actions>): DispatchProps => {
  return {
    onAddFilesToUpload: files => dispatch(UploadActions.addFiles({ files }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(DropUploaderContainer))
