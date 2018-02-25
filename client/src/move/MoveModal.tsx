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
import Breadcrumb from "components/breadcrumb/Breadcrumb"

interface PropsState {
  fsNodes: FsNode[]
  target: FsDirectory
  loading: false
  error?: ApiError
}

interface DispatchProps {
  onCancelMove(): void
  onMove(): void
  onChangeTarget(path: string): void
}

type Props = PropsState & DispatchProps

export class MoveModal extends React.PureComponent<Props> {
  render() {
    const { target, loading, onCancelMove, onMove } = this.props
    const directories = target.content.filter(isDirectory)
    return (
      <Modal onClose={onCancelMove}>
        <ModalHeader title={Messages("ui.move")} />
        <ModalContent>
          <Breadcrumb directory={target} homeTitle={Messages("ui.appName")} onPathClick={this.handleOnChangeTarget}  />
          {directories.length !== 0
            ? this.renderTargetDirectories(directories)
            : <div className={styles.empty}>{Messages("ui.empty")}</div>
          }
        </ModalContent>
        <ModalActions>
          <FlatButton label={Messages("ui.cancel")} onClick={onCancelMove} />
          <FlatButton label={Messages("ui.move")} onClick={onMove} loading={loading} />
        </ModalActions>
      </Modal>
    )
  }

  handleOnChangeTarget = (path: string) => {
    console.log("handleOnChangeTarget", path)
    this.props.onChangeTarget(path === "" ? "/" : path)
  }

  renderTargetDirectories = (directories: FsDirectory[]) => {
    const { onChangeTarget } = this.props
    return (
      <div className={styles.targetDirectories}>
        {directories.map(d => <TargetDirectory key={d.id} target={d} onClick={() => onChangeTarget(d.path) } />)}
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
    onChangeTarget: path => dispatch(MoveActions.changeMoveTarget(path))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MoveModal)
