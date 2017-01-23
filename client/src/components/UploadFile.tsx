import "./uploadFile.css"
import * as React from "react"
import * as ReactDOM from "react-dom"

import * as Api from "../services/Api"
import { Directory } from "../models/FsNode"
import { addCreatedFsNode } from "../directory/directoryActions"
import { store } from "../directory/DirectoryContainer"

import RaisedButton from "material-ui/RaisedButton"

interface Props {
  currentDirectory: Directory
}

export default class UploadFile extends React.Component<Props, void> {

  componentDidMount() {
    const file = ReactDOM.findDOMNode(this.refs["file"])
    const currentDirectory = this.props.currentDirectory
    file.addEventListener("change", function() {
      console.debug("UploadFile.componentDidMount", this.files, currentDirectory.location + this.files[0].name)
      Api.upload((currentDirectory.location + "/" + this.files[0].name).replace("//", "/"), this.files[0], e => {
        console.debug("UploadFile.componentDidMount.upload progression", e)
      }).then(file => {
        store.dispatch(addCreatedFsNode(file))
      })
    })
  }

  componentWillUnmount() {
    const file = ReactDOM.findDOMNode(this.refs["file"])
    console.debug("UploadFile.componentWillUnmount", file)
    //file.removeEventListener("change")
  }

  render() {
    return (
      <RaisedButton
        label="Upload"
        labelPosition="before"
        containerElement="label"
        primary={true}
      >
        <input ref="file" id="file" type="file" className="upload-file-input" />
      </RaisedButton>
    )
  }
}
