/*
import "./breadcrumb.css"
import * as React from "react"
import { hashHistory } from "react-router"

import { FsNode } from "../../models/FsNode"

interface Props {
  directory?: FsNode
}

export default function Breadcrumb({ directory }: Props) {
  const paths = directory && directory.location.substring(1, directory.location.length).split("/").filter(p => p !== "") || []
  const pathsWithRoot = ["", ...paths]
  const len = pathsWithRoot.length
  return (
    <div className="breadcrumb" >
      {paths.length === 0 ?
        <div className="breadcrumb-path-item-root">
          {"Root"}
        </div>
        :
        pathsWithRoot.map((path, i) => {
          return (
            <div className="breadcrumb-path" key={i + path}>
              <div className="breadcrumb-path-item" onClick={() => {
                hashHistory.push(paths.slice(0, i).join("/"))
              }}>{path === "" ? "Root" : path}</div>
              {i !== (len - 1) ?
                <div className="breadcrumb-path-arrow">></div>
                : null
              }
            </div>
          )
        })
      }
    </div>
  )
}
*/