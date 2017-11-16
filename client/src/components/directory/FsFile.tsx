import * as styles from "./FsFile.css"
import * as React from "react"
import { FsNode } from "models/FsNode"
import * as Api from "services/Api"
import FileIcon from "components/icons/FileIcon"

interface Props {
  fsNode: FsNode
}

export default class FsFile extends React.PureComponent<Props> {
  render() {
    const { fsNode } = this.props
    return (
      <a href={Api.getDownloadUrl(fsNode, true)} className={styles.fsFile}>
        <FileIcon />
        <div className={styles.fsFileInfos}>{fsNode.name}</div>
      </a>
    )
  }
}
