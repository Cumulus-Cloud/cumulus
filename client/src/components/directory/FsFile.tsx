import * as styles from "./FsFile.css"
import * as React from "react"
import { FsFile as FsFileModel } from "models/FsNode"
import * as Api from "services/Api"
import FileIcon from "icons/FileIcon"
import IconButton from "components/buttons/IconButton"
import CancelIcon from "icons/CancelIcon"
import Dropdown, { DropdownItem } from "components/menus/Dropdown"
import MoreHorizIcon from "icons/MoreHorizIcon"

interface Props {
  fsNode: FsFileModel
  onCancel: (fsNode: FsFileModel) => void
}

export default class FsFile extends React.PureComponent<Props> {
  render() {
    const { fsNode } = this.props
    return (
      <div className={styles.fsFile}>
        <div className={styles.icon}>
          <FileIcon />
        </div>
        <div className={styles.fsFileInfos}>
          <a href={Api.getDownloadUrl(fsNode, true)}>{fsNode.name}</a>
        </div>
        <div className={styles.actions}>
          <Dropdown right renderAction={() => <IconButton><MoreHorizIcon /></IconButton>}>
            <DropdownItem name={Messages("ui.delete")} icon={<CancelIcon />} onClick={this.handleOnCancel} />
          </Dropdown>
        </div>
      </div>
    )
  }

  handleOnCancel = () => this.props.onCancel(this.props.fsNode)
}
