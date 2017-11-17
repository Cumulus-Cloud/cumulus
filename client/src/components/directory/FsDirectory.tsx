import * as React from "react"
import * as styles from "./FsDirectory.css"
import { history } from "store"

import { FsNode } from "models/FsNode"
import DirectoryIcon from "components/icons/DirectoryIcon"

interface Props {
  fsNode: FsNode
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

  handleOnClick = () => history.push(`files${this.props.fsNode.location}`)
}
