import * as React from "react"
import * as styles from "./PreviewContainer.css"
import { connect, Dispatch } from "react-redux"
import * as FileSystemActions from "./FileSystemActions"
import { GlobalState } from "store"
import { FsFile, videosPreviewAvailable, imagesPreviewAvailable } from "models/FsNode"
import Modal from "components/modals/Modal"
import ModalActions from "components/modals/ModalActions"
import FlatButton from "components/buttons/FlatButton"
import VideoPlayer from "components/preview/VideoPlayer"
import ImagePreview from "components/preview/ImagePreview"

interface DispatchProps {
  onShowPreview(fsNode?: FsFile): void
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
        <div className={styles.previewModal}>
          {this.renderPreview(fsFile)}
          <ModalActions>
            <FlatButton label={Messages("ui.close")} onClick={() => onShowPreview(undefined)} />
          </ModalActions>
        </div>
      </Modal>
    )
  }

  renderPreview = (fsFile: FsFile) => {
    if (videosPreviewAvailable.filter(v => fsFile.name.toLowerCase().endsWith(v)).length > 0) {
      return <VideoPlayer src={`/api/download${encodeURI(fsFile.path)}`} />
    } else if (imagesPreviewAvailable.filter(img => fsFile.name.toLowerCase().endsWith(img)).length > 0) {
      return <ImagePreview src={`/api/download${encodeURI(fsFile.path)}`} />
    }
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    fsFile: state.fileSystem.previewFsFile
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onShowPreview: fsNode => dispatch(FileSystemActions.onShowPreview(fsNode)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PreviewContainer)
