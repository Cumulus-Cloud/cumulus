import "./fsDirectory.css"
import * as React from "react"
import { hashHistory } from "react-router"

import { FsNode } from "../../models/FsNode"
import DirectoryIcon from "../icons/DirectoryIcon"

interface Props {
  fsNode: FsNode
}

export default function FsDirectory({ fsNode }: Props) {
  return (
    <div className="fs-directory" onClick={() => hashHistory.push(fsNode.location)}>
      <DirectoryIcon />
      <div className="fs-directory-infos">{fsNode.name}</div>
    </div>
  )
}
