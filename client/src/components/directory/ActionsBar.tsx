/*
import "./actionsBar.css"
import * as React from "react"
import { createDirectory } from "../../directory/directoryActions"
import { Directory } from "../../models/FsNode"

import UploadFile from "../UploadFile"
import RaisedButton from "../RaisedButton"

interface Props {
  currentDirectory: Directory
}

interface State {
  createNewDirectory: boolean
  newDirectoryName: string
}

export default class ActionsBar extends React.Component<Props, State> {
  state = {
    createNewDirectory: false,
    newDirectoryName: ""
  }
  render() {
    return (
      <div className="actions-bar">
        {this.state.createNewDirectory ?
          <div>
            <input type="text" value={this.state.newDirectoryName} onChange={(e: any) => this.setState({ newDirectoryName: e.target.value } as any)} />
            <button onClick={this.handleCreateDirectory}>
              Create
            </button>
            <button onClick={this.handleCancel}>
              Cancel
            </button>
          </div>
          :
          <RaisedButton onClick={() => this.setState({ createNewDirectory: true } as any)}>
            New Directory
          </RaisedButton>
        }
        <UploadFile currentDirectory={this.props.currentDirectory} />
      </div>
    )
  }

  handleCancel = () => {
    this.setState({ createNewDirectory: false, newDirectoryName: "" })
  }

  handleCreateDirectory = () => {
    createDirectory(this.props.currentDirectory.location + "/" + this.state.newDirectoryName)
    this.handleCancel()
  }
}
*/