import * as React from "react"
import * as styles from "./FsNodeName.css"
import { Dispatch, connect } from "react-redux"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import * as RenameActions from "rename/RenameActions"
import IconButton from "components/buttons/IconButton"
import AddIcon from "icons/AddIcon"

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
      <div>
        <input
          ref={this.handleInputRef}
          className={styles.input}
          type="text"
          value={newName}
          onChange={this.handleOnChange}
        />
        <IconButton onClick={this.handleOnRename(newName, fsNodeToRename)}>
          <AddIcon />
        </IconButton>
      </div>
    )
  }

  handleOnRename = (newName: string, fsNodeToRename: FsNode) => () => this.props.onRename(newName, fsNodeToRename)

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
    onNameChange: name => dispatch(RenameActions.changeName(name)),
    onRename: (newName, fsNode) => dispatch(RenameActions.rename(newName, fsNode)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FsNodeName)
