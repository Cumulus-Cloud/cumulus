import * as React from "react"
import * as styles from "./FsNodeInfos.css"
import { FsNode } from "models/FsNode"
import CloseIcon from "icons/CloseIcon"
import IconButton from "components/buttons/IconButton"

interface Props {
  selectedFsNode: FsNode
  onHideFsNodeInfos(fsNode: FsNode): void
}

export default class FsNodeInfo extends React.PureComponent<Props> {
  render() {
    const { selectedFsNode } = this.props
    return (
      <div className={styles.fsNodeInfo}>
        <div className={styles.header}>
          <h2 className={styles.title}>{Messages("ui.informations")}</h2>
          <IconButton onClick={this.handleOnHideFsNodeInfos}><CloseIcon /></IconButton>
        </div>
        <div>
          <h3>{selectedFsNode.name}</h3>
          <div>{selectedFsNode.path}</div>
        </div>
      </div>
    )
  }

  handleOnHideFsNodeInfos = () => this.props.onHideFsNodeInfos(this.props.selectedFsNode)
}
