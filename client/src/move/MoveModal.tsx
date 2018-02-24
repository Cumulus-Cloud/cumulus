import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import * as MoveActions from "move/MoveActions"

import Modal from "components/modals/Modal"
import ModalActions from "components/modals/ModalActions"
import ModalHeader from "components/modals/ModalHeader"
import ModalContent from "components/modals/ModalContent"
import FlatButton from "components/buttons/FlatButton"
import { FsNode } from "models/FsNode"
import { ApiError } from "services/Api"

interface PropsState {
  fsNodes: FsNode[]
  targetFsNode: FsNode
  loading: false
  error?: ApiError
}

interface DispatchProps {
  onCancelMove(): void
  onMove(): void
}

type Props = PropsState & DispatchProps

export function MoveModal({ onCancelMove, onMove }: Props) {
  return (
    <Modal onClose={onCancelMove}>
      <ModalHeader title={Messages("ui.move")} />
      <ModalContent>
        Move
      </ModalContent>
      <ModalActions>
        <FlatButton label={Messages("ui.cancel")} onClick={onCancelMove} />
        <FlatButton label={Messages("ui.create")} onClick={onMove} />
      </ModalActions>
    </Modal>
  )
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    fsNodes: state.move.fsNodes,
    targetFsNode: state.move.targetFsNode!,
    loading: state.move.loading,
    error: state.move.error,
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onCancelMove: () => dispatch(MoveActions.cancelMove()),
    onMove: () => dispatch(MoveActions.move()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MoveModal)
