import * as React from "react"
import { Dispatch, connect } from "react-redux"
import { match as RouterMatch } from "react-router"
import { GlobalState } from "store"
import * as styles from "./SharedFiles.css"
import AppBar from "components/AppBar"
import InAppNotifContainer from "inAppNotif/InAppNotifContainer"
import PreviewContainer from "files/fileSystem/PreviewContainer"
import LeftPanel from "components/LeftPanel"
import RightPanel from "components/RightPanel"
import * as SbaredFilesActions from "share/SbaredFilesActions"
import { FsNode } from "models/FsNode"

interface DispatchProps {
  fetchSharedFiles(): void
}

interface PropsState {
  sharedFiles: FsNode[]
}

type Props = DispatchProps & PropsState

export class SharedFiles extends React.PureComponent<Props> {

  componentWillMount() {
    const { fetchSharedFiles } = this.props
    fetchSharedFiles()
  }

  render() {
    const { sharedFiles } = this.props
    console.log("sharedFiles", sharedFiles)
    return (
      <div className={styles.sharedFiles}>
        <LeftPanel />
        <div className={styles.mainContainer}>
          <AppBar />
          <InAppNotifContainer />
          <PreviewContainer />
          <div className={styles.filesContainer}>
            <div className={styles.content}>

            </div>
            <RightPanel />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState, props: { match?: RouterMatch<string[]> }): PropsState => {
  return {
    sharedFiles: state.sharedFiles.sharedFiles
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    fetchSharedFiles: () => dispatch(SbaredFilesActions.fetchSharedFiles())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SharedFiles)
