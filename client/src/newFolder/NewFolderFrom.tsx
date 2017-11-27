import * as styles from "./NewFolderFrom.css"
import * as React from "react"
import Input from "components/inputs/Input"
import { ApiError } from "services/Api"

interface Props {
  name: string
  error?: ApiError
  onChange: (value: string) => void
  onSubmit: () => void
}

export default class NewFolderFrom extends React.PureComponent<Props> {
  componentWillMount() {
    document.addEventListener("keydown", this.onKeyPressHandler, false)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyPressHandler, false)
  }

  onKeyPressHandler = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      this.props.onSubmit()
    }
  }

  render() {
    const { name, error, onChange } = this.props
    return (
      <div className={styles.newFolderFrom}>
        <Input
          label="Folder Name"
          value={name}
          onChange={onChange}
          error={error && error.errors && error.errors.path && error.errors.path.map(e => e.message).join()}
        />
      </div>
    )
  }
}
