import * as React from "react"
import * as styles from "./SharedFile.css"
import { SharingItem } from "models/Sharing"
import FsNodeComponent from "components/FsNodeComponent"

interface Props {
  sharedFile: SharingItem
  onDelete(sharingItem: SharingItem): void
}

export default class SharedFile extends React.PureComponent<Props> {
  render() {
    const { sharedFile } = this.props
    return (
      <div className={styles.sharedFile}>
        <FsNodeComponent
          fsNode={sharedFile.fsNode}
          selected={false}
          renameMode={false}
          onSelect={() => {}}
          onOpen={() => {}}
          onShowInfo={() => {}}
          onDelete={this.handleOnDelete}
          onWantMove={() => {}}
          onWantRename={() => {}}
        />
      </div>
    )
  }

  handleOnDelete = () => this.props.onDelete(this.props.sharedFile)
}
