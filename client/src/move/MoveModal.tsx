import * as React from "react"
import * as styles from "./MoveModal.css"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import * as MoveActions from "move/MoveActions"

import Modal from "components/modals/Modal"
import ModalActions from "components/modals/ModalActions"
import ModalHeader from "components/modals/ModalHeader"
import ModalContent from "components/modals/ModalContent"
import FlatButton from "components/buttons/FlatButton"
import { FsNode, FsDirectory, isDirectory } from "models/FsNode"
import { ApiError } from "services/Api"
import TargetDirectory from "move/TargetDirectory"

interface PropsState {
  fsNodes: FsNode[]
  target: FsDirectory
  loading: false
  error?: ApiError
}

interface DispatchProps {
  onCancelMove(): void
  onMove(): void
  onChangeTarget(target: FsDirectory): void
}

type Props = PropsState & DispatchProps

export class MoveModal extends React.PureComponent<Props> {
  render() {
    const { target, onCancelMove, onMove } = this.props
    return (
      <Modal onClose={onCancelMove}>
        <ModalHeader title={Messages("ui.move")} />
        <ModalContent>
            {target.content.length !== 0
              ? this.renderTargetDirectories()
              : <div>Vide</div>
            }
        </ModalContent>
        <ModalActions>
          <FlatButton label={Messages("ui.cancel")} onClick={onCancelMove} />
          <FlatButton label={Messages("ui.create")} onClick={onMove} />
        </ModalActions>
      </Modal>
    )
  }

  renderTargetDirectories = () => {
    const { target, onChangeTarget } = this.props
    return (
      <div className={styles.targetDirectories}>
        {target.content.filter(isDirectory).map(d => <TargetDirectory key={d.id} target={d} onClick={() => onChangeTarget(d) } />)}
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    fsNodes: state.move.fsNodes,
    target: state.move.target!,
    loading: state.move.loading,
    error: state.move.error,
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onCancelMove: () => dispatch(MoveActions.cancelMove()),
    onMove: () => dispatch(MoveActions.move()),
    onChangeTarget: target => dispatch(MoveActions.changeMoveTarget(target))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MoveModal)
