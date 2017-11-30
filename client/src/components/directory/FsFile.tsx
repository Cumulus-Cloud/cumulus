import * as styles from "./FsFile.css"
import * as React from "react"
import { FsFile as FsFileModel, videosPreviewAvailable, imagesPreviewAvailable } from "models/FsNode"
import * as Api from "services/Api"
import FileIcon from "icons/FileIcon"
import IconButton from "components/buttons/IconButton"
import DeleteIcon from "icons/DeleteIcon"
import ShareIcon from "icons/ShareIcon"
import FileDownloadIcon from "icons/FileDownloadIcon"
import Dropdown, { DropdownItem, DropdownLink } from "components/menus/Dropdown"
import MoreHorizIcon from "icons/MoreHorizIcon"

interface Props {
  fsFile: FsFileModel
  onDelete: (fsNode: FsFileModel) => void
  onShowPreview: (fsNode: FsFileModel) => void
  onSharing: (fsNode: FsFileModel) => void
}

export default class FsFile extends React.PureComponent<Props> {
  render() {
    const { fsFile } = this.props
    return (
      <div className={styles.fsFile}>
        <FileIcon />
        <div className={styles.fsFileInfos}>
          {this.isPreviewAvailable(fsFile)
            ? <div className={styles.name} onClick={this.handleOnClick}>{fsFile.name}</div>
            : <a className={styles.name} href={Api.getDownloadUrl(fsFile, true)}>{fsFile.name}</a>
          }
        </div>
        <div className={styles.actions}>
          <Dropdown right renderAction={() => <IconButton><MoreHorizIcon /></IconButton>}>
            <DropdownLink
              href={Api.getDownloadUrl(fsFile, true)}
              name={Messages("ui.download")}
              icon={<FileDownloadIcon />}
            />
            <DropdownItem name={Messages("ui.delete")} icon={<DeleteIcon />} onClick={this.handleOnDelete} />
            <DropdownItem name={Messages("ui.share")} icon={<ShareIcon />} onClick={this.handleOnSharing} />
          </Dropdown>
        </div>
      </div>
    )
  }

  isPreviewAvailable = (fsFile: FsFileModel) => {
    return videosPreviewAvailable.concat(imagesPreviewAvailable).filter(a => fsFile.name.toLowerCase().endsWith(a)).length > 0
  }

  handleOnClick = () => this.props.onShowPreview(this.props.fsFile)
  handleOnSharing = () => this.props.onSharing(this.props.fsFile)
  handleOnDelete = () => this.props.onDelete(this.props.fsFile)
}
