import * as React from "react"
import * as styles from "./RightPanel.css"
import NewFolderContainer from "files/newFolder/NewFolderContainer"
import UploadContainer from "upload/UploadContainer"
import { GlobalState } from "store"
import { Dispatch, connect } from "react-redux"
import { FsNode } from "models/FsNode"
import FsNodeInfos from "components/FsNodeInfos"
import * as FileSystemActions from "files/fileSystem/FileSystemActions"
import MultFsNodesPanel from "components/MultFsNodesPanel"

interface StateProps {
  directory: FsNode
  fsNodeInfosToShow?: FsNode
  selectedFsNodes: FsNode[]
}

interface DispatchProps {
  onHideFsNodeInfos(): void
  onCanselSelectionOfFsNode(): void
}

type Props = StateProps & DispatchProps

export class RightPanel extends React.PureComponent<Props> {
  render() {
    return (
      <div className={styles.rightPanel}>
        {this.renderPanels()}
      </div>
    )
  }

  renderPanels = () => {
    const { selectedFsNodes, fsNodeInfosToShow, onHideFsNodeInfos, onCanselSelectionOfFsNode } = this.props
    if (selectedFsNodes.length > 1) {
      return <MultFsNodesPanel selectedFsNodes={selectedFsNodes} onCanselSelectionOfFsNode={onCanselSelectionOfFsNode} />
    } else if (!!fsNodeInfosToShow || selectedFsNodes.length === 1) {
      return <FsNodeInfos fsNode={fsNodeInfosToShow || selectedFsNodes[0]} onHideFsNodeInfos={onHideFsNodeInfos} />
    } else {
      return (
        <div className={styles.actions}>
          <div className={styles.action}>
            <UploadContainer />
          </div>
          <div className={styles.action}>
            <NewFolderContainer />
          </div>
        </div>
      )
    }
  }
}

const mapStateToProps = (state: GlobalState): StateProps => {
  return {
    directory: state.fileSystem.directory!,
    selectedFsNodes: state.fileSystem.selectedFsNodes,
    fsNodeInfosToShow: state.fileSystem.fsNodeInfosToShow
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onHideFsNodeInfos: () => dispatch(FileSystemActions.hideFsNodeInfos()),
    onCanselSelectionOfFsNode: () => dispatch(FileSystemActions.canselSelectionOfFsNode())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RightPanel)
