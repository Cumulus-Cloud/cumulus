import * as React from "react"
import { connect, Dispatch } from "react-redux"
import * as NewFolderActions from "newFolder/NewFolderActions"
import { NewFolderState } from "newFolder/NewFolderReducer"
import { GlobalState } from "store"
import NewFolderFrom from "components/directory/NewFolderFrom"
import Modal from "components/modals/Modal"
import FlatButton from "components/buttons/FlatButton"

interface DispatchProps {
  onNewFolderNameChange: (newFolderName: string) => void
  onWantCreateNewFolder: () => void
  onCreateNewFolder: (newFolderName: string) => void
}

type Props = NewFolderState & DispatchProps

class NewFolderContainer extends React.PureComponent<Props> {
  render() {
    const { wantCreateNewFolder, onWantCreateNewFolder } = this.props
    return (
      <div>
        <FlatButton label="New Folder" onClick={onWantCreateNewFolder} />
        {wantCreateNewFolder ? this.renderModal() : null}
      </div>
    )
  }

  renderModal = () => {
    const { newFolderName, onNewFolderNameChange, onWantCreateNewFolder } = this.props
    return (
      <Modal title={"Create new directory"} onClose={onWantCreateNewFolder} onSubmit={this.handleOnSubmit}>
        <NewFolderFrom
          name={newFolderName}
          onChange={onNewFolderNameChange}
        />
      </Modal>
    )
  }

  handleOnSubmit = () => {
    const { newFolderName, onCreateNewFolder } = this.props
    onCreateNewFolder(newFolderName)
  }
}

const mapStateToProps = (state: GlobalState): NewFolderState => state.newFolder
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onNewFolderNameChange: newFolderName => dispatch(NewFolderActions.onNewFolderNameChange(newFolderName)),
    onWantCreateNewFolder: () => dispatch(NewFolderActions.onWantCreateNewFolder()),
    onCreateNewFolder: newFolderName => dispatch(NewFolderActions.onCreateNewFolder(newFolderName)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewFolderContainer)
