import * as React from "react"
import * as styles from "./FsDirectory.css"
import { FsNode } from "models/FsNode"
import DirectoryIcon from "components/icons/DirectoryIcon"

interface Props {
  fsNode: FsNode
  onClick: (fsNode: FsNode) => void
}

export default class FsDirectory extends React.PureComponent<Props> {
  render() {
    const { fsNode } = this.props
    return (
      <div className={styles.fsDirectory} onClick={this.handleOnClick}>
        <DirectoryIcon />
        <div className={styles.fsDirectoryInfos}>{fsNode.name}</div>
      </div>
    )
  }

  handleOnClick = () => {
    const { fsNode, onClick } = this.props
    onClick(fsNode)
  }
}
