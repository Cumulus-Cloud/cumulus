import * as styles from "./FsFile.css"
import * as React from "react"
import { FsNode } from "models/FsNode"
import * as Api from "services/Api"
import FileIcon from "components/icons/FileIcon"
import IconButton from "components/buttons/IconButton"
import CancelIcon from "components/icons/CancelIcon"

interface Props {
  fsNode: FsNode
  onCancel: (fsNode: FsNode) => void
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
          <a href={Api.getDownloadUrl(fsNode, true)}>{fsNode.path}</a>
        </div>
        <div className={styles.actions}>
          <IconButton onClick={this.handleOnCancel}>
            <CancelIcon />
          </IconButton>
        </div>
      </div>
    )
  }

  handleOnCancel = () => this.props.onCancel(this.props.fsNode)
}
