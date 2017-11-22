import * as styles from "./Breadcrumb.css"
import * as React from "react"
import { FsNode } from "models/FsNode"

interface Props {
  directory?: FsNode
  onPathClick: (path: string) => void
}

export default class Breadcrumb extends React.PureComponent<Props> {
  render() {
    const { directory } = this.props
    const paths = directory && directory.path.substring(1, directory.path.length).split("/").filter(p => p !== "") || []
    const pathsWithRoot = ["/fs", ...paths]
    const len = pathsWithRoot.length
    return (
      <div className={styles.breadcrumb}>
        {paths.length === 0
          ? this.renderRoot()
          : pathsWithRoot.map((path, i) => this.renderBreadcrumbPath(paths, len, path, i))
        }
      </div>
    )
  }

  renderBreadcrumbPath = (paths: string[], length: number, path: string, i: number) => {
    return (
      <div className={styles.breadcrumbPath} key={path}>
        <div className={styles.breadcrumbPathItem} onClick={this.handlePathOnClick(paths.slice(0, i).join("/"))}>
          {path === "/fs" ? "Root" : path}
        </div>
        {i !== (length - 1)
          ? <div className="breadcrumbPathArrow">></div>
          : null
        }
      </div>
    )
  }

  handlePathOnClick = (path: string) => () => this.props.onPathClick(`/fs/${path}`)

  renderRoot = () => {
    return (
      <div className={styles.breadcrumbPathItemRoot}>
        Root
      </div>
    )
  }
}
