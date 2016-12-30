import "./directory.css"
import * as React from "react"
import { Provider, connect } from "react-redux"
import { hashHistory } from "react-router"
import { DirectoryState } from "./directoryReducer"

import Header from "../components/Header"
import FsList from "../components/directory/FsList"
import Breadcrumb from "../components/directory/Breadcrumb"
import ActionsBar from "../components/directory/ActionsBar"

const Directory = (props: DirectoryState) => {
  return (
    <div>
      <Header title="Cumulus" />
      {props.loading
        ? <div>Loading</div>
        : <div>
            {props.directory
              ? <div>
                  <ActionsBar currentDirectory={props.directory} />
                  <Breadcrumb directory={props.directory} />
                  { (props.directory.content || []).length === 0 ?
                    <div>Empty Directory</div> :
                    <FsList fsNodes={(props.directory.content || [])} />
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

export default connect(mapStateToProps)(Directory)
