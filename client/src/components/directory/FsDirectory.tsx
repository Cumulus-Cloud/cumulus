import * as React from "react"
import * as styles from "./FsDirectory.css"
import { FsDirectory as FsDirectoryModel } from "models/FsNode"
import DirectoryIcon from "icons/DirectoryIcon"
import Dropdown, { DropdownItem } from "components/menus/Dropdown"
import MoreHorizIcon from "icons/MoreHorizIcon"
import IconButton from "components/buttons/IconButton"
import DeleteIcon from "icons/DeleteIcon"

interface Props {
  fsDirectory: FsDirectoryModel
  onClick(fsNode: FsDirectoryModel): void
  onDelete(fsDirectory: FsDirectoryModel): void
}

export default class FsDirectory extends React.PureComponent<Props> {
  render() {
    const { fsDirectory } = this.props
    return (
      <div className={styles.fsDirectory}>
        <DirectoryIcon />
        <div className={styles.fsDirectoryInfos} onClick={this.handleOnClick}>
          <h1 className={styles.title}>
            {fsDirectory.name}
          </h1>
        </div>
        <div className={styles.actions}>
          <Dropdown right renderAction={() => <IconButton><MoreHorizIcon /></IconButton>}>
            <DropdownItem name={Messages("ui.delete")} icon={<DeleteIcon />} onClick={this.handleOnDelete} />
          </Dropdown>
        </div>
      </div>
    )
  }

  handleOnDelete = () => {
    const { fsDirectory, onDelete } = this.props
    onDelete(fsDirectory)
  }

  handleOnClick = () => {
    const { fsDirectory, onClick } = this.props
    onClick(fsDirectory)
  }
}
