import * as React from "react"
import * as styles from "./FsNodeInfos.css"
import * as Api from "services/Api"
import {
  FsNode, isFile, ImageMetadata, isImageMetadata, PDFDocumentMetadata, isPDFDocumentMetadata, DefaultMetadata, isDefaultMetadata
} from "models/FsNode"
import CloseIcon from "icons/CloseIcon"
import IconButton from "components/buttons/IconButton"
import FsMetadata from "components/FsMetadata"
import * as parse from "date-fns/parse"
import * as distanceInWordsToNow from "date-fns/distance_in_words_to_now"

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
          <FsMetadata label={Messages("ui.metadata.size")} value={fsNode.humanReadableSize} />
          {!!fsNode.compression ? <FsMetadata label={Messages("ui.metadata.compression")} value={fsNode.compression} /> : null}
          {!!fsNode.cipher ? <FsMetadata label={Messages("ui.metadata.cipher")} value={fsNode.cipher} /> : null}
          <FsMetadata label={Messages("ui.metadata.hash")} value={fsNode.hash} />
          <FsMetadata label={Messages("ui.metadata.creation")} value={distanceInWordsToNow(parse(fsNode.creation))} />
          <FsMetadata label={Messages("ui.metadata.modification")} value={distanceInWordsToNow(parse(fsNode.modification))} />
          {isImageMetadata(fsNode.metadata) ? ImageMetadataComponent(fsNode.metadata) : null}
          {isPDFDocumentMetadata(fsNode.metadata) ? PDFMetadataComponent(fsNode.metadata) : null}
          {isDefaultMetadata(fsNode.metadata) ? DefaultMetadataComponent(fsNode.metadata) : null}
        </>
      )
    } else {
      return (
        <>
          <FsMetadata label={Messages("ui.metadata.creation")} value={distanceInWordsToNow(parse(fsNode.creation))} />
          <FsMetadata label={Messages("ui.metadata.modification")} value={distanceInWordsToNow(parse(fsNode.modification))} />
        </>
      )
    }
  }

  handleOnHideFsNodeInfos = () => this.props.onHideFsNodeInfos()
}

function ImageMetadataComponent(metadata: ImageMetadata) {
  return (
    <>
      {!!metadata.width ? <FsMetadata label={Messages("ui.metadata.width")} value={`${metadata.width} px`} /> : null}
      {!!metadata.height ? <FsMetadata label={Messages("ui.metadata.height")} value={`${metadata.height} px`} /> : null}
      {!!metadata.maker ? <FsMetadata label={Messages("ui.metadata.maker")} value={metadata.maker} /> : null}
      {!!metadata.model ? <FsMetadata label={Messages("ui.metadata.model")} value={metadata.model} /> : null}
      {!!metadata.datetime ? <FsMetadata label={Messages("ui.metadata.datetime")} value={metadata.datetime} /> : null}
    </>
  )
}

function PDFMetadataComponent(metadata: PDFDocumentMetadata) {
  return (
    <>
      {!!metadata.title ? <FsMetadata label={Messages("ui.metadata.title")} value={`${metadata.title}`} /> : null}
      {!!metadata.author ? <FsMetadata label={Messages("ui.metadata.author")} value={metadata.author} /> : null}
      {!!metadata.creator ? <FsMetadata label={Messages("ui.metadata.creator")} value={metadata.creator} /> : null}
      {!!metadata.producer ? <FsMetadata label={Messages("ui.metadata.producer")} value={`${metadata.producer}`} /> : null}
      {!!metadata.pageCount ? <FsMetadata label={Messages("ui.metadata.pageCount")} value={`${metadata.pageCount}`} /> : null}
      {!!metadata.creationDate ? <FsMetadata label={Messages("ui.metadata.creationDate")} value={`${metadata.creationDate}`} /> : null}
      {!!metadata.modificationDate ? <FsMetadata label={Messages("ui.metadata.modificationDate")} value={`${metadata.modificationDate}`} /> : null}
    </>
  )
}

function DefaultMetadataComponent(metadata: DefaultMetadata) {
  return (
    <>
    </>
  )
}
