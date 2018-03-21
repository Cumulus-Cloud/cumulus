import * as styles from "./FsNodeComponent.css"
import * as React from "react"
import { FsFile, getExtention, FsNode, isFile, FsDirectory, isPreviewAvailable } from "models/FsNode"
import * as Api from "services/Api"
import FileIcon from "icons/FileIcon"
import IconButton from "components/buttons/IconButton"
import DeleteIcon from "icons/DeleteIcon"
import ShareIcon from "icons/ShareIcon"
import MoveIcon from "icons/MoveIcon"
import FileDownloadIcon from "icons/FileDownloadIcon"
import Dropdown, { DropdownItem, DropdownLink } from "components/menus/Dropdown"
import MoreHorizIcon from "icons/MoreHorizIcon"
import DirectoryIcon from "icons/DirectoryIcon"
import classNames from "utils/ClassNames"
import FsNodeName from "files/rename/FsNodeName"
import EditIcon from "icons/EditIcon"

interface Props {
  fsNode: FsNode
  selected: boolean
  renameMode: boolean
  onSelect(fsNode: FsNode): void
  onOpen(fsNode: FsNode): void
  onShowInfo(fsNode: FsNode): void
  onDelete(fsNode: FsNode): void
  onSharing(fsNode: FsNode): void
  onWantMove(fsNode: FsNode): void
  onWantRename(fsNode: FsNode): void
}

export default class FsNodeComponent extends React.PureComponent<Props> {
  render() {
    const { selected } = this.props
    const clesses = classNames({
      [styles.fsNode]: true,
      [styles.selected]: selected
    })
    return (
      <div className={clesses}>
        <div className={styles.icon} onClick={this.handleOnSelect}>
          {this.renderIcon()}
        </div>
        {this.renderName()}
        <div className={styles.actions}>
          {this.renderActions()}
        </div>
      </div>
    )
  }

  renderName = () => {
    const { fsNode, renameMode } = this.props
    if (isFile(fsNode) && !isPreviewAvailable(fsNode) && !renameMode) {
      return (
        <a className={styles.infos} href={Api.getDownloadUrl(fsNode)}>
          <FsNodeName fsNode={fsNode} />
        </a>
      )
    } else {
      return (
        <div className={styles.infos} onClick={this.handleOnOpen}>
          <FsNodeName fsNode={fsNode} />
        </div>
      )
    }
  }

  renderIcon = () => {
    const { fsNode } = this.props
    if (fsNode.nodeType === "FILE") {
      return <FileIcon extention={getExtention(fsNode.name).toUpperCase()} />
    } else {
      return <DirectoryIcon width={30} height={30} />
    }
  }

  renderActions = () => {
    const { fsNode } = this.props
    if (isFile(fsNode)) {
      return this.renderFileActions(fsNode)
    } else {
      return this.renderDirectoryActions(fsNode)
    }
  }

  renderFileActions = (fsFile: FsFile) => {
    return (
      <Dropdown right renderAction={ActionButton}>
        <DropdownLink
          href={Api.getDownloadUrl(fsFile)}
          name={Messages("ui.download")}
          icon={<FileDownloadIcon />}
        />
        <DropdownItem name={Messages("ui.share")} icon={<ShareIcon />} onClick={this.handleOnSharing} />
        <DropdownItem name={Messages("ui.rename")} icon={<EditIcon />} onClick={this.handleOnWantRename} />
        <DropdownItem name={Messages("ui.move")} icon={<MoveIcon />} onClick={this.handleOnWantMove} />
        <DropdownItem name={Messages("ui.delete")} icon={<DeleteIcon />} onClick={this.handleOnDelete} />
      </Dropdown>
    )
  }

  renderDirectoryActions = (fsDirectory: FsDirectory) => {
    return (
      <Dropdown right renderAction={ActionButton}>
        <DropdownItem name={Messages("ui.rename")} icon={<EditIcon />} onClick={this.handleOnWantRename} />
        <DropdownItem name={Messages("ui.move")} icon={<MoveIcon />} onClick={this.handleOnWantMove} />
        <DropdownItem name={Messages("ui.delete")} icon={<DeleteIcon />} onClick={this.handleOnDelete} />
      </Dropdown>
    )
  }

  withNotRenameMode = (callback: () => void) => {
    if (!this.props.renameMode) {
      callback()
    }
  }

  handleOnSelect = () => this.withNotRenameMode(() => this.props.onSelect(this.props.fsNode))
  handleOnOpen = () => this.withNotRenameMode(() => this.props.onOpen(this.props.fsNode))
  handleOnShowInfo = () => this.props.onShowInfo(this.props.fsNode)
  handleOnDelete = () => this.props.onDelete(this.props.fsNode)
  handleOnSharing = () => this.props.onSharing(this.props.fsNode)
  handleOnWantMove = () => this.props.onWantMove(this.props.fsNode)
  handleOnWantRename = () => this.props.onWantRename(this.props.fsNode)
}

function ActionButton() {
  return <IconButton><MoreHorizIcon /></IconButton>
}
