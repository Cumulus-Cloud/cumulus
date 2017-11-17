// import * as styles from "./uploadFile.css"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Directory } from "models/FsNode"

interface Props {
  currentDirectory: Directory
  onUpload: () => void
  onError: (error: any) => void
}

export default class UploadFile extends React.Component<Props, void> {

  componentDidMount() {
    const file = ReactDOM.findDOMNode(this.refs["file"])
    file.addEventListener("change", this.handleOnChange)
  }

  handleOnChange = (e: any) => {
    // const { currentDirectory, onUpload, onError } = this.props
    console.debug("UploadFile.componentDidMount", e, this)
      /*
      console.debug("UploadFile.componentDidMount", this.files, currentDirectory.location + this.files[0].name)
      Api.upload((currentDirectory.location + "/" + this.files[0].name).replace("//", "/"), this.files[0], e => {
        console.debug("UploadFile.componentDidMount.upload progression", e)
      }).then(this.handleOnUpload).catch(onError)
      */
  }

  handleOnUpload = (file: any) => {
    const { onUpload } = this.props
    onUpload()
  }

  componentWillUnmount() {
    const file = ReactDOM.findDOMNode(this.refs["file"])
    console.debug("UploadFile.componentWillUnmount", file)
    file.removeEventListener("change", this.handleOnChange)
  }

  render() {
    return (
      <input ref="file" id="file" type="file" className="upload-file-input" />
    )
  }
}
