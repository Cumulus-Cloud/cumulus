import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import * as UploadActions from "upload/UploadActions"
import Modal from "components/modals/Modal"
import ModalActions from "components/modals/ModalActions"
import FlatButton from "components/buttons/FlatButton"
import UploadFile from "components/UploadFile"

interface DispatchProps {
  onWantUpload: () => void
  onAddFiles: (files: File[]) => void
  onUploadFile: (path: string, file: File) => void
}

interface PropsState {
  files: File[]
  wantUpload: boolean
  directory: FsNode
}

type Props = PropsState & DispatchProps

class NewFolderContainer extends React.PureComponent<Props> {
  render() {
    const { wantUpload, onWantUpload } = this.props
    return (
      <div>
        <FlatButton label="Upload" onClick={onWantUpload} />
        {wantUpload ? this.renderModal() : null}
      </div>
    )
  }

  renderModal = () => {
    const { onWantUpload, files } = this.props
    return (
      <Modal
        title="Upload"
        onClose={onWantUpload}
      >
        <div>
          <UploadFile onChange={this.handleOnChange} />
          {files.map(file => {
            return (
              <div key={file.name}>
                <div>
                  Name : {file.name}
                </div>
                <div>
                  Size : {file.size}
                </div>
                <div>
                  Type : {file.type}
                </div>
                <div>
                  Modification Date : {(file as any).lastModified}
                </div>
              </div>
            )
          })}
        </div>
        <ModalActions>
          <FlatButton label="Cancel" onClick={onWantUpload} />
          <FlatButton label="Upload" onClick={this.handleOnUpload} />
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
