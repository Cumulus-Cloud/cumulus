import * as React from "react"
import * as styles from "./RightPanel.css"
import NewFolderContainer from "newFolder/NewFolderContainer"
import UploadContainer from "upload/UploadContainer"
import { GlobalState } from "store"
import { Dispatch, connect } from "react-redux"
import { FsNode } from "models/FsNode"
import FsNodeInfos from "components/FsNodeInfos"
import * as FileSystemActions from "fileSystem/FileSystemActions"

interface StateProps {
  directory: FsNode
  selectedFsNodes: FsNode[]
}

interface DispatchProps {
  onHideFsNodeInfos(fsNode: FsNode): void
}

type Props = StateProps & DispatchProps

export class RightPanel extends React.PureComponent<Props> {
  render() {
    console.log("RightPanel.render", this.props)
    return (
      <div className={styles.rightPanel}>
        {this.renderPanels()}
      </div>
    )
  }

  renderPanels = () => {
    const { selectedFsNodes, onHideFsNodeInfos } = this.props
    if (selectedFsNodes.length === 1) {
      return <FsNodeInfos selectedFsNode={selectedFsNodes[0]} onHideFsNodeInfos={onHideFsNodeInfos} />
    } else {
      return (
        <>
          <UploadContainer />
          <NewFolderContainer />
        </>
      )
    }
  }
}

const mapStateToProps = (state: GlobalState): StateProps => {
  return {
    directory: state.fileSystem.directory!,
    selectedFsNodes: state.fileSystem.selectedFsNodes,
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onHideFsNodeInfos: fsNode => dispatch(FileSystemActions.hideFsNodeInfos(fsNode))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RightPanel)
