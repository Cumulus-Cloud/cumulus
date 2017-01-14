import "./directory.css"
import * as React from "react"
import { Action } from "redux"
import { Provider, connect } from "react-redux"
import { hashHistory } from "react-router"
import { DirectoryState } from "./directoryReducer"
import { toggleCreateNewDirectory, changeNewDirectoryName, createDirectory } from "./directoryActions"

import FsList from "../components/directory/FsList"
import Breadcrumb from "../components/directory/Breadcrumb"
import UploadFile from "../components/UploadFile"

import AppBar from "material-ui/AppBar"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"
import RaisedButton from "material-ui/RaisedButton"
import FlatButton from "material-ui/FlatButton"
import Dialog from "material-ui/Dialog"
import TextField from "material-ui/TextField"

import CreateDirectoryDialog from "./CreateDirectoryDialog"

interface Props extends DirectoryState {
  onCreateNewDirectory: () => void
  onNewDirectoryNameChange: (event: React.FormEvent<HTMLInputElement>) => void
}

const Directory = ({ loading, directory, newDirectoryName, errors, whantCreateNewDirectory, onCreateNewDirectory, onNewDirectoryNameChange }: Props) => {
  return (
    <div>
      <AppBar
        title="Cumulus"
        iconClassNameRight="muidocs-icon-navigation-expand-more"
      />
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <RaisedButton label="New Directory" primary={true} onClick={onCreateNewDirectory} />
          <UploadFile currentDirectory={directory} />
        </ToolbarGroup>
      </Toolbar>
      <Breadcrumb directory={directory} />
      <CreateDirectoryDialog
        open={whantCreateNewDirectory}
        newDirectoryName={newDirectoryName}
        onCancel={onCreateNewDirectory}
        errors={errors}
        onNewDirectoryNameChange={onNewDirectoryNameChange}
        onSubmit={() => {
          if (directory) {
            createDirectory(directory.location + "/" + newDirectoryName)
          }
        }}
      />
      {loading
        ? <div>Loading</div>
        : <div>
            {directory
              ? <div>
                  { (directory.content || []).length === 0 ?
                    <div>Empty Directory</div> :
                    <FsList fsNodes={(directory.content || [])} />
                  }
                </div>
              : null
            }
          </div>
      }
    </div>
  )
}

const mapStateToProps = (state: DirectoryState) => {
  return {
    ...state
  }
}

const mapDispatchToProps = (dispatch: (action: Action) => void) => {
  return {
    onCreateNewDirectory: () => {
      dispatch(toggleCreateNewDirectory())
    },
    onNewDirectoryNameChange: (event: React.FormEvent<HTMLInputElement>) => {
      dispatch(changeNewDirectoryName(event.target.value))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Directory)
