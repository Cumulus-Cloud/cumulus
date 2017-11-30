import * as styles from "./UploadFile.css"
import * as React from "react"
import ProgressBar from "components/progress/ProgressBar"
import FileIcon from "icons/FileIcon"
import IconButton from "components/buttons/IconButton"
import CancelIcon from "icons/CancelIcon"
import { FileToUpload } from "models/FileToUpload"

interface Props {
  fileToUpload: FileToUpload
}
export default function UploadFile({ fileToUpload }: Props) {
  return (
    <div className={styles.uploadFile}>
      <FileIcon />
      <div className={styles.infos}>
        <div className={styles.name}>{fileToUpload.file.name}</div>
        <ProgressBar progress={fileToUpload.progress} indeterminate={fileToUpload.progress === 100 && fileToUpload.loading} />
      </div>
      <IconButton>
        <CancelIcon />
      </IconButton>
    </div>
  )
}
