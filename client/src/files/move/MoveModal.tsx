import * as React from "react"
import * as styles from "./MoveModal.css"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { MoveActions } from "files/move/MoveActions"

import Modal from "components/modals/Modal"
import ModalActions from "components/modals/ModalActions"
import ModalHeader from "components/modals/ModalHeader"
import ModalContent from "components/modals/ModalContent"
import FlatButton from "components/buttons/FlatButton"
import { FsNode, FsDirectory, isDirectory } from "models/FsNode"
import TargetDirectory from "files/move/TargetDirectory"
import Breadcrumb from "components/breadcrumb/Breadcrumb"
import { ApiError } from "models/ApiError"
import { Actions } from "actions"

interface PropsState {
  fsNodes: FsNode[]
  target: FsDirectory
  loading: false
  error?: ApiError
}

interface DispatchProps {
  onCancelMove(): void
  onMove(fsNodeToMove: FsNode, target: FsDirectory): void
  onChangeTarget(path: string): void
}

type Props = PropsState & DispatchProps

export class MoveModal extends React.PureComponent<Props> {
  render() {
    const { target, loading, onCancelMove } = this.props
    const directories = target.content.filter(isDirectory)
    return (
      <Modal onClose={onCancelMove}>
        <ModalHeader title={Messages("ui.move")} />
        <ModalContent>
          <Breadcrumb
            directory={target}
            homeTitle={Messages("ui.appName")}
            onPathClick={this.handleOnChangeTargetBreadcrumb}
          />
          {directories.length !== 0
            ? this.renderTargetDirectories(directories)
            : <div className={styles.empty}>{Messages("ui.empty")}</div>
          }
        </ModalContent>
        <ModalActions>
          <FlatButton label={Messages("ui.cancel")} onClick={onCancelMove} />
          <FlatButton label={Messages("ui.move")} onClick={this.handleOnMove} loading={loading} />
        </ModalActions>
      </Modal>
    )
  }

  handleOnChangeTargetBreadcrumb = (path: string) => {
    this.props.onChangeTarget(path === "" ? "/" : path)
  }

  renderTargetDirectories = (directories: FsDirectory[]) => {
    return (
      <div className={styles.targetDirectories}>
        {directories.map(this.renderDirectory)}
      </div>
    )
  }

  renderDirectory = (directory: FsDirectory) => {
    return (
      <TargetDirectory
        key={directory.id}
        target={directory}
        onClick={this.handleOnChangeTarget(directory)}
      />
    )
  }

  handleOnMove = () => {
    const { fsNodes, target, onMove } = this.props
    if (fsNodes.length > 0) {
      const fsNodeToMove = fsNodes[0]
      onMove(fsNodeToMove, target)
    }
  }

  handleOnChangeTarget = (directory: FsDirectory) => () => this.props.onChangeTarget(directory.path)
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    fsNodes: state.move.fsNodes,
    target: state.move.target!,
    loading: state.move.loading,
    error: state.move.error,
  }
}
const mapDispatchToProps = (dispatch: Dispatch<Actions>): DispatchProps => {
  return {
    onCancelMove: () => dispatch(MoveActions.cancelMove()),
    onMove: (fsNodeToMove, target) => dispatch(MoveActions.move(fsNodeToMove, target)),
    onChangeTarget: path => dispatch(MoveActions.changeMoveTarget(path))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MoveModal)
