import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import * as UploadActions from "upload/UploadActions"
import Modal from "components/modals/Modal"
import ModalActions from "components/modals/ModalActions"
import FlatButton from "components/buttons/FlatButton"
import Uploader from "components/upload/Uploader"
import UploadFile from "components/upload/UploadFile"

interface DispatchProps {
  onWantUpload: () => void
  onAddFiles: (files: File[]) => void
  onUploadFile: (path: string, file: File) => void
}

interface PropsState {
  files: File[]
  wantUpload: boolean
  loading: boolean
  progress: number
  directory: FsNode
}

type Props = PropsState & DispatchProps

class NewFolderContainer extends React.PureComponent<Props> {
  render() {
    const { wantUpload, onWantUpload } = this.props
    return (
      <div>
        <FlatButton label={Messages("ui.upload")} onClick={onWantUpload} />
        {wantUpload ? this.renderModal() : null}
      </div>
    )
  }

  renderModal = () => {
    const { onWantUpload, files, loading, progress } = this.props
    return (
      <Modal title={Messages("ui.upload")} onClose={onWantUpload}>
        <div>
          <Uploader onChange={this.handleOnChange} />
          {files.map(file => <UploadFile key={file.name} progress={progress} loading={loading} file={file} />)}
        </div>
        <ModalActions>
          <FlatButton label={Messages("ui.cancel")} onClick={onWantUpload} />
          <FlatButton label={Messages("ui.upload")} loading={loading} onClick={this.handleOnUpload} />
        </ModalActions>
      </Modal>
    )
  }

  handleOnUpload = () => {
    const { directory, files, onUploadFile } = this.props
    files.forEach(file => {
      onUploadFile(`${directory.path}/${file.name}`.replace("//", "/"), file)
    })
  }

  handleOnChange = (fileList: FileList) => {
    this.props.onAddFiles([fileList[0]])
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    files: state.upload.files,
    wantUpload: state.upload.wantUpload,
    loading: state.upload.loading,
    progress: state.upload.progress,
    directory: state.directories.directory!
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onWantUpload: () => dispatch(UploadActions.onWantUpload()),
    onAddFiles: (files) => dispatch(UploadActions.onAddFiles(files)),
    onUploadFile: (path, file) => dispatch(UploadActions.onUploadFile(path, file)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewFolderContainer)
