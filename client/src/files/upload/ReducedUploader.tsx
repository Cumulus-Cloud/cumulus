import * as React from "react"
import * as styles from "./ReducedUploader.css"
import { UploadState } from "files/upload/UploadReducer"
import LoaderIcon from "icons/LoaderIcon"
import { FileToUpload } from "models/FileToUpload"
import IconButton from "components/buttons/IconButton"
import ArrowUpIcon from "icons/ArrowUpIcon"
import UploadIcon from "icons/UploadIcon"
import { FsDirectory } from "models/FsNode"
import { UploadModalStatus } from "models/UploadModalStatus"
import ProgressBlock from "components/progress/ProgressBlock"

interface OwnProps extends UploadState {
  directory: FsDirectory
}

interface DispatchProps {
  onUploaderModalStatus(status: UploadModalStatus): void
  onUploadFile(path: string, fileToUpload: FileToUpload): void
}

type Props = OwnProps & DispatchProps

export default class ReducedUploader extends React.PureComponent<Props> {
  render() {
    const { filesToUpload } = this.props
    const progress = totalProgress(filesToUpload)
    const loading = !!filesToUpload.find(fileToUpload => fileToUpload.status === "Loading")
    const indeterminate = progress === filesToUpload.length * 100 && loading
    const notUploaded = filesToUpload.filter(f => f.status === "Ready").length
    return (
      <div className={styles.reducedUploader}>
        <ProgressBlock indeterminate={indeterminate} progress={progress} className={styles.reducedUploaderProgress}>
          <div className={styles.container}>
            <div className={styles.stats}>
              <div className={styles.counter}>{notUploaded} {Messages("ui.notUploaded")}</div>
              <div className={styles.counter}>{filesToUpload.filter(f => f.status === "Loading").length} {Messages("ui.uploading")}</div>
              <div className={styles.counter}>{filesToUpload.filter(f => f.status === "Done").length} {Messages("ui.completed")}</div>
              <IconButton disable={notUploaded === 0} onClick={this.handleOnUpload}>
                <UploadIcon color={notUploaded === 0 ? "#6F6F6F" : "#3DC7BE"} />
              </IconButton>
            </div>
            <div className={styles.actions}>
              {loading ? <LoaderIcon width={30} height={30} color="#3DC7BE" /> : null}
              <IconButton onClick={this.handleOnUploaderModalStatus("Open")}><ArrowUpIcon width={30} height={30} color="#3DC7BE" /></IconButton>
            </div>
          </div>
        </ProgressBlock>
      </div>
    )
  }

  handleOnUploaderModalStatus = (status: UploadModalStatus) => () => this.props.onUploaderModalStatus(status)

  handleOnUpload = () => {
    const { filesToUpload, onUploadFile } = this.props
    filesToUpload.filter(f => f.status === "Ready").forEach(fileToUpload => {
      onUploadFile(`${fileToUpload.directory.path}/${fileToUpload.name}`.replace("//", "/"), fileToUpload)
    })
  }
}

export function totalProgress(filesToUpload: FileToUpload[]): number {
  const files = filesToUpload.filter(f => f.status === "Loading")
  return files.reduce((acc, fileToUpload) => acc + fileToUpload.progress, 0) / files.length
}
