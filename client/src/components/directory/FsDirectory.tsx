import * as React from "react"
import * as styles from "./FsDirectory.css"
import { FsDirectory as FsDirectoryModel } from "models/FsNode"
import DirectoryIcon from "icons/DirectoryIcon"

interface Props {
  fsNode: FsDirectoryModel
  onClick: (fsNode: FsDirectoryModel) => void
}

export default class FsDirectory extends React.PureComponent<Props> {
  render() {
    const { fsNode } = this.props
    return (
      <div className={styles.fsDirectory} onClick={this.handleOnClick}>
        <DirectoryIcon />
        <div className={styles.fsDirectoryInfos} onClick={this.handleOnClick}>
          <h1 className={styles.title}>
            {fsNode.name}
          </h1>
        </div>
      </div>
    )
  }

  handleOnClick = () => {
    const { fsNode, onClick } = this.props
    onClick(fsNode)
  }
}
