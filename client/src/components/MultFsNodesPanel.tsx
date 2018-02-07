import * as React from "react"
import * as styles from "./FsNodeInfos.css"
import { FsNode } from "models/FsNode"
import CloseIcon from "icons/CloseIcon"
import IconButton from "components/buttons/IconButton"

interface Props {
  selectedFsNodes: FsNode[]
  onCanselSelectionOfFsNode(): void
}

export default class MultFsNodesPanel extends React.PureComponent<Props> {
  render() {
    const { selectedFsNodes, onCanselSelectionOfFsNode } = this.props
    return (
      <div className={styles.fsNodeInfo}>
        <div className={styles.header}>
          <h2 className={styles.title}>{selectedFsNodes.length} Selected</h2>
          <IconButton onClick={onCanselSelectionOfFsNode}><CloseIcon /></IconButton>
        </div>
        <div>
        </div>
      </div>
    )
  }
}
