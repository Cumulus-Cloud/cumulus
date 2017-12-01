import * as styles from "./Uploader.css"
import * as React from "react"
import classNames from "utils/ClassNames"

interface Props {
  onChange: (file: FileList) => void
}

interface State {
  hover: boolean
}

export default class Uploader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hover: false
    }
  }

  handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      this.props.onChange(e.target.files)
    }
    this.setState({ hover: false })
  }

  render() {
    const inputClasses = classNames({
      [styles.input]: true,
      [styles.hover]: this.state.hover,
    })
    const labelClasses = classNames({
      [styles.label]: true,
      [styles.hover]: this.state.hover,
    })
    return (
      <div className={styles.uploader}>
        <input
          id="uploader-input"
          type="file"
          multiple
          className={inputClasses}
          onChange={this.handleOnChange}
          onDragEnter={this.handleOnDragEnter}
          onDragLeave={this.handleOnDragLeave}
        />
        <label className={labelClasses} htmlFor="uploader-input">{Messages("ui.uploader")}</label>
      </div>
    )
  }

  handleOnDragLeave = () => this.setState({ hover: false })
  handleOnDragEnter = () => this.setState({ hover: true })
}
