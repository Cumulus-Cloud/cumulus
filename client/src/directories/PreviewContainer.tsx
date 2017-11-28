import * as React from "react"
import { connect, Dispatch } from "react-redux"
import * as DirectoriesActions from "./DirectoriesActions"
import { GlobalState } from "store"
import { FsFile, videosPreviewAvailable, imagesPreviewAvailable } from "models/FsNode"
import Modal from "components/modals/Modal"
import FlatButton from "components/buttons/FlatButton"
import VideoPlayer from "components/preview/VideoPlayer"
import ImagePreview from "components/preview/ImagePreview"
import * as Api from "services/Api"

interface DispatchProps {
  onShowPreview: (fsNode?: FsFile) => void
}

interface PropsState {
  fsFile?: FsFile
}

type Props = PropsState & DispatchProps

class PreviewContainer extends React.PureComponent<Props> {
  render() {
    const { fsFile } = this.props
    return !!fsFile ? this.renderModal(fsFile) : null
  }

  renderModal = (fsFile: FsFile) => {
    const { onShowPreview } = this.props
    return (
      <Modal onClose={() => onShowPreview(undefined)}>
        {this.renderPreview(fsFile)}
        <FlatButton label={Messages("ui.cancel")} onClick={() => onShowPreview(undefined)} />
      </Modal>
    )
  }

  renderPreview = (fsFile: FsFile) => {
    if (videosPreviewAvailable.filter(v => fsFile.name.toLowerCase().endsWith(v)).length > 0) {
      return <VideoPlayer src={`/api/stream${fsFile.path}`} />
    } else if (imagesPreviewAvailable.filter(img => fsFile.name.toLowerCase().endsWith(".jpg")).length > 0) {
      return <ImagePreview src={Api.getDownloadUrl(fsFile, true)} />
    }
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    fsFile: state.directories.previewFsFile
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onShowPreview: fsNode => dispatch(DirectoriesActions.onShowPreview(fsNode)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PreviewContainer)
