import * as styles from "./NewFolderFrom.css"
import * as React from "react"
import Input from "components/inputs/Input"

interface Props {
  name: string
  onChange: (value: string) => void
}

export default class NewFolderFrom extends React.PureComponent<Props> {
  render() {
    const { name, onChange } = this.props
    return (
      <div className={styles.newFolderFrom}>
        <Input label={Messages("ui.folderName")} value={name} onChange={onChange} />
      </div>
    )
  }
}
