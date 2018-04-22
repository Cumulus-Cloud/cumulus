import * as React from "react"
import * as styles from "./FsNodeName.css"
import { Dispatch, connect } from "react-redux"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import { RenameActions } from "files/rename/RenameActions"
import IconButton from "components/buttons/IconButton"
import DoneIcon from "icons/DoneIcon"
import CloseIcon from "icons/CloseIcon"
import KeyDownAction from "components/KeyDownAction"

interface StateProps {
  newName: string
  fsNodeToRename?: FsNode
}

interface OwnProps {
  fsNode: FsNode
}

interface DispatchProps {
  onNameChange(name: string): void
  onRename(newName: string, fsNode: FsNode): void
  onCancelRename(): void
}

type Props = StateProps & OwnProps & DispatchProps

export class FsNodeName extends React.PureComponent<Props> {
  render() {
    const { fsNode, fsNodeToRename } = this.props
    if (fsNodeToRename && fsNodeToRename.id === fsNode.id) {
      return this.renderRenameMode(fsNodeToRename)
    } else {
      return this.renderName()
    }
  }

  renderName = () => {
    const { fsNode } = this.props
    return (
      <h2 className={styles.fsNodeName}>{fsNode.name}</h2>
    )
  }

  renderRenameMode = (fsNodeToRename: FsNode) => {
    const { newName } = this.props
    return (
      <KeyDownAction onKeyDown={this.handleOnKeydown}>
        <div className={styles.rename}>
          <input
            ref={this.handleInputRef}
            className={styles.input}
            type="text"
            value={newName}
            onChange={this.handleOnChange}
          />
          <IconButton onClick={this.handleOnRename(newName, fsNodeToRename)}>
            <DoneIcon />
          </IconButton>
          <IconButton onClick={this.props.onCancelRename}>
            <CloseIcon width={15} height={15} />
          </IconButton>
        </div>
      </KeyDownAction>
    )
  }

  handleOnKeydown = (e: KeyboardEvent) => {
    const { newName, fsNodeToRename, onRename, onCancelRename } = this.props
    if (e.code === "Enter") {
      onRename(newName, fsNodeToRename!)
    } else if (e.code === "Escape") {
      onCancelRename()
    }
  }

  handleOnRename = (newName: string, fsNodeToRename: FsNode) => () => {
    const { onRename, onCancelRename } = this.props
    if (fsNodeToRename.name !== newName) {
      onRename(newName, fsNodeToRename)
    } else {
      onCancelRename()
    }
  }

  handleInputRef = (ref: HTMLInputElement | null) => ref && ref.focus()

  handleOnChange = (event: React.FormEvent<HTMLInputElement>) => this.props.onNameChange(event.currentTarget.value)
}

const mapStateToProps = (state: GlobalState, props: OwnProps): OwnProps & StateProps => {
  return {
    fsNode: props.fsNode,
    newName: state.rename.newName,
    fsNodeToRename: state.rename.fsNodeToRename,
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onNameChange: name => dispatch(RenameActions.changeName({ name })),
    onRename: (newName, fsNode) => dispatch(RenameActions.rename({ newName, fsNode })),
    onCancelRename: () => dispatch(RenameActions.cancelRename()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FsNodeName)
