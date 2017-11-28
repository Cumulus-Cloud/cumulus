import * as React from "react"
import { connect, Dispatch } from "react-redux"
import * as PreviewActions from "./PreviewActions"
import { PreviewState } from "preview/PreviewReducer"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import Modal from "components/modals/Modal"
import FlatButton from "components/buttons/FlatButton"
import VideoPlayer from "components/preview/VideoPlayer"

interface DispatchProps {
  onShowPreview: (fsNode?: FsNode) => void
}

interface PropsState extends PreviewState {
}

type Props = PropsState & DispatchProps

class PreviewContainer extends React.PureComponent<Props> {
  render() {
    const { fsNode } = this.props
    return !!fsNode ? this.renderModal(fsNode) : null
  }

  renderModal = (fsNode: FsNode) => {
    const { onShowPreview } = this.props
    return (
      <Modal onClose={() => onShowPreview(undefined)}>
        <VideoPlayer src={`/api/stream${fsNode.path}`} />
        <FlatButton label={Messages("ui.cancel")} onClick={() => onShowPreview(undefined)} />
      </Modal>
    )
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    fsNode: state.preview.fsNode
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onShowPreview: fsNode => dispatch(PreviewActions.onShowPreview(fsNode)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PreviewContainer)
