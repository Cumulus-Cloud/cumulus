import * as React from "react"
import { Dispatch, connect } from "react-redux"
import { match as RouterMatch } from "react-router"
import { GlobalState } from "store"
import * as styles from "./SharedFiles.css"
import AppBarContainer from "app/AppBarContainer"
import InAppNotifContainer from "inAppNotif/InAppNotifContainer"
import PreviewContainer from "files/fileSystem/PreviewContainer"
import LeftPanel from "components/LeftPanel"
import RightPanel from "components/RightPanel"
import { SharedFilesActions } from "share/SharedFilesActions"
import { SharingItem } from "models/Sharing"
import { ApiError } from "models/ApiError"
import SharedFile from "share/SharedFile"

interface DispatchProps {
  fetchSharedFiles(): void
  onDeleteSharingItem(sharingItem: SharingItem): void
}

interface PropsState {
  sharings: SharingItem[],
  error?: ApiError,
  loading: boolean,
}

type Props = DispatchProps & PropsState

export class SharedFiles extends React.PureComponent<Props> {

  componentWillMount() {
    const { fetchSharedFiles } = this.props
    fetchSharedFiles()
  }

  render() {
    const { sharings, onDeleteSharingItem } = this.props
    return (
      <div className={styles.sharedFiles}>
        <LeftPanel />
        <div className={styles.mainContainer}>
          <AppBarContainer />
          <InAppNotifContainer />
          <PreviewContainer />
          <div className={styles.filesContainer}>
            <div className={styles.content}>
              {sharings.map(sharedFile => <SharedFile key={sharedFile.sharing.id} sharedFile={sharedFile} onDelete={onDeleteSharingItem} />)}
            </div>
            <RightPanel />
          </div>
        </div>
      </div>
    )
  }

  renderSharedFiles = () => {
    return (
      <div></div>
    )
  }
}

const mapStateToProps = (state: GlobalState, props: { match?: RouterMatch<string[]> }): PropsState => {
  return {
    sharings: state.sharedFiles.sharings,
    error: state.sharedFiles.error,
    loading: state.sharedFiles.loading,
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    fetchSharedFiles: () => dispatch(SharedFilesActions.fetchSharedFiles()),
    onDeleteSharingItem: sharing => dispatch(SharedFilesActions.deleteSharedFile({ sharing }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SharedFiles)
