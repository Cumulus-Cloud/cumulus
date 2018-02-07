import * as styles from "./FsFile.css"
import * as React from "react"
import { FsFile as FsFileModel, videosPreviewAvailable, imagesPreviewAvailable, getExtention } from "models/FsNode"
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
  onShowFsNodeInfos(fsFile: FsFileModel): void
  onDelete(fsNode: FsFileModel): void
  onShowPreview(fsNode: FsFileModel): void
  onSharing(fsNode: FsFileModel): void
}

export default class FsFile extends React.PureComponent<Props> {
  render() {
    const { fsFile } = this.props
    return (
      <div className={styles.fsFile}>
        <div className={styles.icon} onClick={this.isPreviewAvailable(fsFile) ? this.handleOnClick : undefined}>
          <FileIcon extention={getExtention(fsFile.name).toUpperCase()} />
        </div>
        <div className={styles.fsFileInfos} onClick={this.handleOnShowFsNodeInfos}>
          <h2 className={styles.name}>{fsFile.name}</h2>
        </div>
        <div className={styles.actions}>
          <Dropdown right renderAction={this.renderAction}>
            <DropdownLink
              href={Api.getDownloadUrl(fsFile, true)}
              name={Messages("ui.download")}
              icon={this.fileDownloadIcon}
            />
            <DropdownItem name={Messages("ui.delete")} icon={this.deleteIcon} onClick={this.handleOnDelete} />
            <DropdownItem name={Messages("ui.share")} icon={this.shareIcon} onClick={this.handleOnSharing} />
          </Dropdown>
        </div>
      </div>
    )
  }

  deleteIcon = <DeleteIcon />
  shareIcon = <ShareIcon />
  fileDownloadIcon = <FileDownloadIcon />

  renderAction = () => <IconButton><MoreHorizIcon /></IconButton>

  isPreviewAvailable = (fsFile: FsFileModel) => {
    return videosPreviewAvailable.concat(imagesPreviewAvailable).filter(a => fsFile.name.toLowerCase().endsWith(a)).length > 0
  }

  handleOnClick = () => this.props.onShowPreview(this.props.fsFile)
  handleOnSharing = () => this.props.onSharing(this.props.fsFile)
  handleOnDelete = () => this.props.onDelete(this.props.fsFile)
  handleOnShowFsNodeInfos = () => this.props.onShowFsNodeInfos(this.props.fsFile)
}
