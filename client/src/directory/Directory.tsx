/*
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

interface Props extends DirectoryState {
  onCreateNewDirectory: () => void
  onNewDirectoryNameChange: (event: React.FormEvent<HTMLInputElement>) => void
}

const Directory = (props: Props) => {
  const { loading, directory, newDirectoryName, errors, whantCreateNewDirectory, onCreateNewDirectory, onNewDirectoryNameChange } = props
  return (
    <div>
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
*/