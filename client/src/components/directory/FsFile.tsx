import "./fsFile.css"
import * as React from "react"
import { FsNode } from "../../models/FsNode"
import * as Api from "../../services/Api"
import FileIcon from "../icons/FileIcon"

interface Props {
  fsNode: FsNode
}

export default function FsFile({ fsNode }: Props) {
  return (
    <a href={Api.getDownloadUrl(fsNode, true)} className="fs-file">
      <FileIcon />
      <div className="fs-file-infos">{fsNode.name}</div>
    </a>
  )
}
