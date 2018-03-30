import * as React from "react"
import * as styles from "./UploadModal.css"
import Modal from "components/modals/Modal"
import ModalHeader from "components/modals/ModalHeader"
import ModalContent from "components/modals/ModalContent"
import ModalActions from "components/modals/ModalActions"
import FlatButton from "components/buttons/FlatButton"
import Uploader from "components/upload/Uploader"
import UploadFile from "components/upload/UploadFile"
import { FileToUpload, fromFileList } from "models/FileToUpload"
import { FsDirectory, Cipher, Compression } from "models/FsNode"
import { UploadModalStatus } from "models/UploadModalStatus"

interface Props {
  directory: FsDirectory
  filesToUpload: FileToUpload[]
  onUploaderModalStatus(status: UploadModalStatus): void
  onAddFiles(filesToUpload: FileToUpload[]): void
  onRemoveFileToUpload(fileToUpload: FileToUpload): void
  onUploadFile(path: string, fileToUpload: FileToUpload): void
  onSelectCipher(fileToUpload: FileToUpload, cipher?: Cipher): void
  onSelectCompression(fileToUpload: FileToUpload, compression?: Compression): void
}

export default class UploadModal extends React.PureComponent<Props> {
  render() {
    const { filesToUpload } = this.props
    return (
      <Modal onClose={this.handleOnUploaderModalStatus("None")}>
        <ModalHeader title={Messages("ui.upload")} />
        <ModalContent>
          {filesToUpload.length > 0
            ? <div className={styles.filesToUploadList}>
                {filesToUpload.map(this.renderFileToUpload)}
              </div>
            : null}
        </ModalContent>
        <ModalActions>
          <div className={styles.actions}>
            <Uploader onChange={this.handleOnChange} />
            <div>
              <FlatButton label={Messages("ui.reduce")} onClick={this.handleOnUploaderModalStatus("Reduced")} />
              {this.renderActions()}
            </div>
          </div>
        </ModalActions>
      </Modal>
    )
  }

  handleOnUploaderModalStatus = (status: UploadModalStatus) => () => this.props.onUploaderModalStatus(status)

  renderActions = () => {
    const { filesToUpload } = this.props
    const isDone = filesToUpload.filter(f => f.fileStatus !== "Done").length === 0
    const loading = !!filesToUpload.find(fileToUpload => fileToUpload.fileStatus === "Loading")
    if (isDone) {
      return (
        <FlatButton
          label={Messages("ui.done")}
          loading={loading}
          onClick={this.handleOnUploaderModalStatus("None")}
        />
      )
    } else {
      return (
        <FlatButton
          label={Messages("ui.upload")}
          loading={loading}
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
    filesToUpload.filter(f => f.fileStatus === "Ready").forEach(fileToUpload => {
      onUploadFile(`${directory.path}/${fileToUpload.name}`.replace("//", "/"), fileToUpload)
    })
  }

  handleOnChange = (fileList: FileList) => {
    const { directory } = this.props
    const files = fromFileList(fileList, directory)
    if (files.length > 0) {
      this.props.onAddFiles(files)
    }
  }
}
