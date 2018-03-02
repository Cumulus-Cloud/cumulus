import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { FsNode, Compression, Cipher } from "models/FsNode"
import * as UploadActions from "files/upload/UploadActions"
import { UploadState } from "./UploadReducer"
import Modal from "components/modals/Modal"
import ModalHeader from "components/modals/ModalHeader"
import ModalContent from "components/modals/ModalContent"
import ModalActions from "components/modals/ModalActions"
import FlatButton from "components/buttons/FlatButton"
import Uploader from "components/upload/Uploader"
import UploadFile from "components/upload/UploadFile"
import { FileToUpload } from "models/FileToUpload"
import GhostButton from "components/buttons/GhostButton"

interface DispatchProps {
  onWantUpload(): void
  onAddFiles(filesToUpload: FileToUpload[]): void
  onRemoveFileToUpload(fileToUpload: FileToUpload): void
  onUploadFile(path: string, fileToUpload: FileToUpload): void
  onSelectCipher(fileToUpload: FileToUpload, cipher?: Cipher): void
  onSelectCompression(fileToUpload: FileToUpload, compression?: Compression): void
}

interface PropsState extends UploadState {
  directory: FsNode
}

type Props = PropsState & DispatchProps

class NewFolderContainer extends React.PureComponent<Props> {
  render() {
    const { wantUpload, onWantUpload } = this.props
    return (
      <>
        <GhostButton label={Messages("ui.upload")} onClick={onWantUpload} matchParent />
        {wantUpload ? this.renderModal() : null}
      </>
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
          {this.renderActions()}
        </ModalActions>
      </Modal>
    )
  }

  renderActions = () => {
    const { filesToUpload, onWantUpload } = this.props
    const isDone = filesToUpload.filter(f => !f.done).length === 0
    if (isDone) {
      return (
        <FlatButton
          label={Messages("ui.done")}
          loading={!!filesToUpload.find(fileToUpload => fileToUpload.loading)}
          onClick={onWantUpload}
        />
      )
    } else {
      return (
        <FlatButton
          label={Messages("ui.upload")}
          loading={!!filesToUpload.find(fileToUpload => fileToUpload.loading)}
          onClick={this.handleOnUpload}
        />
      )
    }
  }

  renderFileToUpload = (fileToUpload: FileToUpload) => {
    const { onRemoveFileToUpload, onSelectCipher, onSelectCompression } = this.props
    return (
      <UploadFile
        key={fileToUpload.id}
        fileToUpload={fileToUpload}
        onDelete={onRemoveFileToUpload}
        onSelectCipher={onSelectCipher}
        onSelectCompression={onSelectCompression}
      />
    )
  }

  handleOnUpload = () => {
    const { directory, filesToUpload, onUploadFile } = this.props
    filesToUpload.filter(f => !f.done).forEach(fileToUpload => {
      onUploadFile(`${directory.path}/${fileToUpload.file.name}`.replace("//", "/"), fileToUpload)
    })
  }

  handleOnChange = (fileList: FileList) => {
    const { idCounter } = this.props
    const files: File[] = []
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < fileList.length; i++) {
      files.push(fileList[i])
    }
    if (files.length > 0) {
      this.props.onAddFiles(files.map((file, i) => {
        return {
          id: idCounter + i,
          progress: 0,
          loading: false,
          file,
          done: false,
        }
      }))
    }
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    ...state.upload,
    directory: state.fileSystem.directory!,
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onWantUpload: () => dispatch(UploadActions.onWantUpload()),
    onAddFiles: (files) => dispatch(UploadActions.onAddFiles(files)),
    onUploadFile: (path, file) => dispatch(UploadActions.onUploadFile(path, file)),
    onRemoveFileToUpload: fileToUpload => dispatch(UploadActions.onRemoveFileToUpload(fileToUpload)),
    onSelectCipher: (fileToUpload, cipher) => dispatch(UploadActions.onSelectCipher(fileToUpload, cipher)),
    onSelectCompression: (fileToUpload, compression) => dispatch(UploadActions.onSelectCompression(fileToUpload, compression)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewFolderContainer)
