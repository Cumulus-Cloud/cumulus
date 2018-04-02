import * as styles from "./Uploader.css"
import * as React from "react"

interface Props {
  onChange(file: FileList): void
}

export default class Uploader extends React.PureComponent<Props> {
  handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      this.props.onChange(e.target.files)
    }
  }

  render() {
    return (
      <div className={styles.uploader}>
        <input
          id="uploader-input"
          type="file"
          multiple
          className={styles.input}
          onChange={this.handleOnChange}
        />
        <label className={styles.label} htmlFor="uploader-input">{Messages("ui.uploader")}</label>
      </div>
    )
  }
}
