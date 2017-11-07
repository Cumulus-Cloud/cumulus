/*
import "./fsList.css"
import * as React from "react"
import { FsNode } from "../../models/FsNode"

import FsDirectory from "./FsDirectory"
import FsFile from "./FsFile"

interface Props {
  fsNodes: FsNode[]
}

export default function FsList({ fsNodes }: Props) {
  return (
    <div className="fs-list">
      {fsNodes.map(node => {
        if (node.type === "directory") {
          return <FsDirectory key={node.id} fsNode={node} />
        } else {
          return <FsFile key={node.id} fsNode={node} />
        }
      })}
    </div>
  )
}
*/