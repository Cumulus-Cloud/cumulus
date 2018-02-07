import * as React from "react"
import * as styles from "./FsNodeInfos.css"
import * as Api from "services/Api"
import { FsNode, isFile } from "models/FsNode"
import CloseIcon from "icons/CloseIcon"
import IconButton from "components/buttons/IconButton"

interface Props {
  fsNode: FsNode
  onHideFsNodeInfos(): void
}

export default class FsNodeInfo extends React.PureComponent<Props> {
  render() {
    const { fsNode } = this.props
    return (
      <div className={styles.fsNodeInfo}>
        <div className={styles.header}>
          <h2 className={styles.title}>{Messages("ui.informations")}</h2>
          <IconButton onClick={this.handleOnHideFsNodeInfos}><CloseIcon /></IconButton>
        </div>
        <div>
          <h3 className={styles.name}>{fsNode.name}</h3>
          {isFile(fsNode) && fsNode.hasThumbnail
            ? <img className={styles.preview} src={Api.getThumbnail(fsNode)} />
            : null
          }
          <div className={styles.infos}>
            {this.renderInfos()}
          </div>
        </div>
      </div>
    )
  }

  renderInfos = () => {
    const { fsNode } = this.props
    if (isFile(fsNode)) {
      return (
        <>
          <p className={styles.info}>Size: {fsNode.humanReadableSize}</p>
          <p className={styles.info}>hash: {fsNode.hash}</p>
          {!!fsNode.compression ? <p className={styles.info}>Compression: {fsNode.compression}</p> : null}
          {!!fsNode.cipher ? <p className={styles.info}>Cipher: {fsNode.cipher}</p> : null}
        </>
      )
    } else {
      return null
    }
  }

  handleOnHideFsNodeInfos = () => this.props.onHideFsNodeInfos()
}
