import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import * as UploadActions from "upload/UploadActions"
import { UploadState } from "./UploadReducer"
import Modal from "components/modals/Modal"
import ModalHeader from "components/modals/ModalHeader"
import ModalContent from "components/modals/ModalContent"
import ModalActions from "components/modals/ModalActions"
import FlatButton from "components/buttons/FlatButton"
import Uploader from "components/upload/Uploader"
import UploadFile from "components/upload/UploadFile"
import { FileToUpload } from "models/FileToUpload"

interface DispatchProps {
  onWantUpload: () => void
  onAddFiles: (filesToUpload: FileToUpload[]) => void
  onUploadFile: (path: string, fileToUpload: FileToUpload) => void
}

interface PropsState extends UploadState {
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
    const { onWantUpload, filesToUpload } = this.props
    return (
      <Modal onClose={onWantUpload}>
        <ModalHeader title={Messages("ui.upload")} />
        <ModalContent>
          <Uploader onChange={this.handleOnChange} />
          {filesToUpload.map(this.renderFileToUpload)}
        </ModalContent>
        <ModalActions>
          <FlatButton label={Messages("ui.cancel")} onClick={onWantUpload} />
          <FlatButton
            label={Messages("ui.upload")}
            loading={!!filesToUpload.find(fileToUpload => fileToUpload.loading)}
            onClick={this.handleOnUpload}
          />
        </ModalActions>
      </Modal>
    )
  }

  renderFileToUpload = (fileToUpload: FileToUpload) => {
    return (
      <UploadFile key={fileToUpload.id} fileToUpload={fileToUpload} />
    )
  }

  handleOnUpload = () => {
    const { directory, filesToUpload, onUploadFile } = this.props
    filesToUpload.forEach(filesToUpload => {
      onUploadFile(`${directory.path}/${filesToUpload.file.name}`.replace("//", "/"), filesToUpload)
    })
  }

  handleOnChange = (fileList: FileList) => {
    const { idCounter } = this.props
    this.props.onAddFiles([{
      id: idCounter,
      progress: 0,
      loading: false,
      file: fileList[0]
    }])
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    ...state.upload,
    directory: state.directories.directory!,
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
