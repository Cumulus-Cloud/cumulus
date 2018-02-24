import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { NewFolderState } from "newFolder/NewFolderReducer"
import * as NewFolderActions from "newFolder/NewFolderActions"
import { FsNode } from "models/FsNode"
import FlatButton from "components/buttons/FlatButton"
import NewFolderModal from "newFolder/NewFolderModal"

interface DispatchProps {
  onNewFolderNameChange(newFolderName: string): void
  onWantCreateNewFolder(): void
  onCreateNewFolder(directory: FsNode, newFolderName: string): void
}

interface PropsState extends NewFolderState {
  directory: FsNode
}

type Props = PropsState & DispatchProps

class NewFolderContainer extends React.PureComponent<Props> {
  render() {
    const { wantCreateNewFolder, onWantCreateNewFolder } = this.props
    return (
      <>
      <FlatButton label={Messages("ui.newFolder")} onClick={onWantCreateNewFolder} />
      {wantCreateNewFolder ? this.renderModal() : null}
      </>
    )
  }

  renderModal = () => {
    const { error, newFolderName, onNewFolderNameChange, onWantCreateNewFolder } = this.props
    return (
      <NewFolderModal
        error={error}
        newFolderName={newFolderName}
        onWantCreateNewFolder={onWantCreateNewFolder}
        onNewFolderNameChange={onNewFolderNameChange}
        onNewFolderSubmit={this.handleOnSubmit}
      />
    )
  }

  handleOnSubmit = () => {
    const { newFolderName, directory, onCreateNewFolder } = this.props
    onCreateNewFolder(directory, newFolderName)
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    ...state.newFolder,
    directory: state.fileSystem.directory!
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onNewFolderNameChange: newFolderName => dispatch(NewFolderActions.onNewFolderNameChange(newFolderName)),
    onWantCreateNewFolder: () => dispatch(NewFolderActions.onWantCreateNewFolder()),
    onCreateNewFolder: (directory, newFolderName) => {
      dispatch(NewFolderActions.onCreateNewFolder(directory, newFolderName))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewFolderContainer)
