import * as React from "react"
import * as styles from "./FsNodeInfos.css"
import { FsNode } from "models/FsNode"
import CloseIcon from "icons/CloseIcon"
import IconButton from "components/buttons/IconButton"

interface Props {
  fsNode: FsNode
  onHideFsNodeInfos(fsNode: FsNode): void
}

export default class MultFsNodesPanel extends React.PureComponent<Props> {
  render() {
    return (
      <div className={styles.fsNodeInfo}>
        <div className={styles.header}>
          <h2 className={styles.title}>Selected</h2>
          <IconButton onClick={this.handleOnHideFsNodeInfos}><CloseIcon /></IconButton>
        </div>
        <div>
        </div>
      </div>
    )
  }

  handleOnHideFsNodeInfos = () => this.props.onHideFsNodeInfos(this.props.fsNode)
}
