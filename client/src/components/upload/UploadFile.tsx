import * as styles from "./UploadFile.css"
import * as React from "react"
import ProgressBar from "components/progress/ProgressBar"
import FileIcon from "icons/FileIcon"
import IconButton from "components/buttons/IconButton"
import CancelIcon from "icons/CancelIcon"

interface Props {
  progress: number
  loading: boolean
  file: File
}
export default function UploadFile({ progress, loading, file }: Props) {
  return (
    <div className={styles.uploadFile}>
      <FileIcon />
      <div className={styles.infos}>
        <div className={styles.name}>{file.name}</div>
        <ProgressBar progress={progress} indeterminate={progress === 100 && loading} />
      </div>
      <IconButton>
        <CancelIcon />
      </IconButton>
    </div>
  )
}
