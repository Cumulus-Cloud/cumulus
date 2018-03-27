import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { Compression, Cipher, FsDirectory } from "models/FsNode"
import * as UploadActions from "files/upload/UploadActions"
import { UploadState } from "./UploadReducer"
import { FileToUpload } from "models/FileToUpload"
import GhostButton from "components/buttons/GhostButton"
import UploadModal from "files/upload/UploadModal"
import ReducedUploader from "files/upload/ReducedUploader"
import { UploadModalStatus } from "models/UploadModalStatus"

interface DispatchProps {
  onUploaderModalStatus(status: UploadModalStatus): void
  onAddFiles(filesToUpload: FileToUpload[]): void
  onRemoveFileToUpload(fileToUpload: FileToUpload): void
  onUploadFile(path: string, fileToUpload: FileToUpload): void
  onSelectCipher(fileToUpload: FileToUpload, cipher?: Cipher): void
  onSelectCompression(fileToUpload: FileToUpload, compression?: Compression): void
}

interface PropsState extends UploadState {
  directory: FsDirectory
}

type Props = PropsState & DispatchProps

class NewFolderContainer extends React.PureComponent<Props> {
  render() {
    const { status } = this.props
    return (
      <>
        <GhostButton label={Messages("ui.upload")} onClick={this.handleOnUploaderModalStatus("Open")} matchParent />
        {status === "Open" ? <UploadModal {...this.props} /> : null}
        {status === "Reduced" ? <ReducedUploader {...this.props} /> : null}
      </>
    )
  }

  handleOnUploaderModalStatus = (status: UploadModalStatus) => () => this.props.onUploaderModalStatus(status)
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    ...state.upload,
    directory: state.fileSystem.directory!,
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onUploaderModalStatus: status => dispatch(UploadActions.uploaderModalStatus(status)),
    onAddFiles: (files) => dispatch(UploadActions.addFiles(files)),
    onUploadFile: (path, file) => dispatch(UploadActions.uploadFile(path, file)),
    onRemoveFileToUpload: fileToUpload => dispatch(UploadActions.removeFileToUpload(fileToUpload)),
    onSelectCipher: (fileToUpload, cipher) => dispatch(UploadActions.onSelectCipher(fileToUpload, cipher)),
    onSelectCompression: (fileToUpload, compression) => dispatch(UploadActions.onSelectCompression(fileToUpload, compression)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewFolderContainer)
