import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { NewFolderState } from "files/newFolder/NewFolderReducer"
import { NewFolderActions } from "files/newFolder/NewFolderActions"
import { FsNode } from "models/FsNode"
import NewFolderModal from "files/newFolder/NewFolderModal"
import GhostButton from "components/buttons/GhostButton"
import { Actions } from "actions"

interface DispatchProps {
  onNewFolderNameChange(newFolderName: string): void
  onWantCreateNewFolder(): void
  onCreateNewFolder(currentDirectory: FsNode, newFolderName: string): void
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
        <GhostButton label={Messages("ui.newFolder")} onClick={onWantCreateNewFolder} matchParent />
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
const mapDispatchToProps = (dispatch: Dispatch<Actions>): DispatchProps => {
  return {
    onNewFolderNameChange: newFolderName => dispatch(NewFolderActions.newFolderNameChange({ newFolderName })),
    onWantCreateNewFolder: () => dispatch(NewFolderActions.wantCreateNewFolder()),
    onCreateNewFolder: (currentDirectory, newFolderName) => dispatch(NewFolderActions.createNewFolder({ currentDirectory, newFolderName })),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewFolderContainer)
