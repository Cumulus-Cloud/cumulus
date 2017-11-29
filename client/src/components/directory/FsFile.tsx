import * as styles from "./FsFile.css"
import * as React from "react"
import { FsFile as FsFileModel, videosPreviewAvailable, imagesPreviewAvailable } from "models/FsNode"
import * as Api from "services/Api"
import FileIcon from "icons/FileIcon"
import IconButton from "components/buttons/IconButton"
import DeleteIcon from "icons/DeleteIcon"
import FileDownloadIcon from "icons/FileDownloadIcon"
import Dropdown, { DropdownItem, DropdownLink } from "components/menus/Dropdown"
import MoreHorizIcon from "icons/MoreHorizIcon"

interface Props {
  fsNode: FsFileModel
  onDelete: (fsNode: FsFileModel) => void
  onShowPreview: (fsNode: FsFileModel) => void
}

export default class FsFile extends React.PureComponent<Props> {
  render() {
    const { fsNode } = this.props
    return (
      <div className={styles.fsFile}>
        <FileIcon />
        <div className={styles.fsFileInfos}>
          {this.isPreviewAvailable(fsNode)
            ? <div className={styles.name} onClick={this.handleOnClick}>{fsNode.name}</div>
            : <a className={styles.name} href={Api.getDownloadUrl(fsNode, true)}>{fsNode.name}</a>
          }
        </div>
        <div className={styles.actions}>
          <Dropdown right renderAction={() => <IconButton><MoreHorizIcon /></IconButton>}>
            <DropdownLink
              href={Api.getDownloadUrl(fsNode, true)}
              name={Messages("ui.download")}
              icon={<FileDownloadIcon />}
            />
            <DropdownItem name={Messages("ui.delete")} icon={<DeleteIcon />} onClick={this.handleOnDelete} />
          </Dropdown>
        </div>
      </div>
    )
  }

  isPreviewAvailable = (fsFile: FsFileModel) => {
    return videosPreviewAvailable.concat(imagesPreviewAvailable).filter(a => fsFile.name.toLowerCase().endsWith(a)).length > 0
  }

  handleOnClick = () => this.props.onShowPreview(this.props.fsNode)

  handleOnDelete = () => this.props.onDelete(this.props.fsNode)
}
