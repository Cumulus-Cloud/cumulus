import * as styles from "./UploadFile.css"
import * as React from "react"

interface Props {
  onChange: (file: FileList) => void
}

export default class UploadFile extends React.PureComponent<Props> {
  handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      this.props.onChange(e.target.files)
    }
  }
  render() {
    return (
      <div className={styles.uploadFile}>
        <input type="file" className={styles.uploadFileInput} onChange={this.handleOnChange} />
      </div>
    )
  }
}
