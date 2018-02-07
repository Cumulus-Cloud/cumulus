import * as styles from "./UploadFile.css"
import * as React from "react"
import ProgressBar from "components/progress/ProgressBar"
import FileIcon from "icons/FileIcon"
import IconButton from "components/buttons/IconButton"
import CancelIcon from "icons/CancelIcon"
import { FileToUpload } from "models/FileToUpload"
import { Compression, Cipher, getExtention } from "models/FsNode"

interface Props {
  fileToUpload: FileToUpload
  onDelete(fileToUpload: FileToUpload): void
  onSelectCipher(fileToUpload: FileToUpload, cipher?: Cipher): void
  onSelectCompression(fileToUpload: FileToUpload, compression?: Compression): void
}
export default class UploadFile extends React.PureComponent<Props> {
  render() {
    const { fileToUpload } = this.props
    return (
      <div className={styles.uploadFile}>
        <FileIcon extention={getExtention(fileToUpload.file.name)} />
        <div className={styles.infos}>
          <div className={styles.name}>{fileToUpload.file.name}</div>
          <div className={styles.parametres}>
            <div className={styles.parametre}>
              <input
                id={`fileToUpload-cipher-${fileToUpload.id}`}
                type="checkbox"
                checked={!!fileToUpload.cipher}
                onChange={this.handleOnSelectCipher}
              />
              <label htmlFor={`fileToUpload-cipher-${fileToUpload.id}`}>{Messages("ui.secure")}</label>
            </div>
            <div className={styles.parametre}>
              <input
                id={`fileToUpload-compression-gzip-${fileToUpload.id}`}
                type="checkbox"
                value="GZIP"
                checked={fileToUpload.compression === "GZIP"}
                onChange={this.handleOnSelectCompression}
              />
              <label htmlFor={`fileToUpload-compression-gzip-${fileToUpload.id}`}>{Messages("ui.compressionGzip")}</label>
            </div>
            <div className={styles.parametre}>
              <input
                id={`fileToUpload-compression-deflate-${fileToUpload.id}`}
                type="checkbox"
                value="DEFLATE"
                checked={fileToUpload.compression === "DEFLATE"}
                onChange={this.handleOnSelectCompression}
              />
              <label htmlFor={`fileToUpload-compression-deflate-${fileToUpload.id}`}>{Messages("ui.compressionDeflate")}</label>
            </div>
          </div>
          <ProgressBar progress={fileToUpload.progress} indeterminate={fileToUpload.progress === 100 && fileToUpload.loading} />
        </div>
        <IconButton onClick={this.handleOnDelete}>
          <CancelIcon />
        </IconButton>
      </div>
    )
  }
  handleOnSelectCipher = (e: any) => {
    const { onSelectCipher, fileToUpload } = this.props
    onSelectCipher(fileToUpload, e.target.checked ? "AES" : undefined)
  }
  handleOnSelectCompression = (e: any) => {
    const { onSelectCompression, fileToUpload } = this.props
    onSelectCompression(fileToUpload, fileToUpload.compression === e.target.value ? undefined : e.target.value)
  }
  handleOnDelete = () => this.props.onDelete(this.props.fileToUpload)
}
