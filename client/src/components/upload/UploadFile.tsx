import * as styles from "./UploadFile.css"
import * as React from "react"
import IconButton from "components/buttons/IconButton"
import CloseIcon from "icons/CloseIcon"
import CompressIcon from "icons/CompressIcon"
import LockCloseIcon from "icons/LockCloseIcon"
import LockOpenIcon from "icons/LockOpenIcon"
import { FileToUpload } from "models/FileToUpload"
import { Compression, Cipher } from "models/FsNode"
import { humanFileSize } from "utils/files"
import ProgressBlock from "components/progress/ProgressBlock"

interface Props {
  fileToUpload: FileToUpload
  onDelete(fileToUpload: FileToUpload): void
  onSelectCipher(fileToUpload: FileToUpload, cipher?: Cipher): void
  onSelectCompression(fileToUpload: FileToUpload, compression?: Compression): void
}

export default class UploadFile extends React.PureComponent<Props> {
  render() {
    const { fileToUpload } = this.props
    const loading = fileToUpload.fileStatus === "Loading"
    const indeterminate = fileToUpload.progress === 100 && loading
    return (
      <ProgressBlock className={styles.uploadFile} indeterminate={indeterminate} progress={fileToUpload.progress}>
        <div className={styles.infos}>
          <div className={styles.name}>{fileToUpload.name}</div>
          <div className={styles.parametres}>
            <div className={styles.parametre}>
              <IconButton onClick={this.handleOnSelectCipher} title={Messages("ui.secure")} disable={loading}>
                {!!fileToUpload.cipher
                  ? <LockCloseIcon color="#4caf50" width={17} height={17} />
                  : <LockOpenIcon color="#6F6F6F" width={17} height={17} />
                }
              </IconButton>
            </div>
            <div className={styles.parametre}>
              <IconButton onClick={this.handleOnSelectCompression} title={Messages("ui.compressionGzip")} disable={loading}>
                <CompressIcon color={fileToUpload.compression === "GZIP" ? "#4caf50" : "#6F6F6F" } width={17} height={17} />
              </IconButton>
            </div>
            <div className={styles.size}>{humanFileSize(fileToUpload.file.size)}</div>
            <div className={styles.parametre}>
              <IconButton onClick={this.handleOnDelete}>
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </div>
      </ProgressBlock>
    )
  }
  handleOnSelectCipher = () => {
    const { onSelectCipher, fileToUpload } = this.props
    onSelectCipher(fileToUpload, !fileToUpload.cipher ? "AES" : undefined)
  }
  handleOnSelectCompression = () => {
    const { onSelectCompression, fileToUpload } = this.props
    onSelectCompression(fileToUpload, !fileToUpload.compression ? "GZIP" : undefined)
  }
  handleOnDelete = () => this.props.onDelete(this.props.fileToUpload)
}
