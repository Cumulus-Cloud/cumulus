import * as styles from "./Breadcrumb.css"
import * as React from "react"
import { FsNode } from "models/FsNode"
import classNames from "utils/ClassNames"
import ArrowRightIcon from "icons/ArrowRightIcon"

interface Props {
  homeTitle: string
  directory?: FsNode
  onPathClick(path: string): void
}

export default class Breadcrumb extends React.PureComponent<Props> {
  render() {
    const { directory, homeTitle } = this.props
    const paths = directory && directory.path.substring(1, directory.path.length).split("/").filter(p => p !== "") || []
    const pathsWithRoot = ["/fs", ...paths]
    const len = pathsWithRoot.length
    return (
      <div className={styles.breadcrumb}>
        {paths.length === 0
          ? <BreadcrumbItem title={homeTitle} active={false} />
          : pathsWithRoot.map((path, i) => this.renderBreadcrumbPath(paths, len, path, i))
        }
      </div>
    )
  }

  renderBreadcrumbPath = (paths: string[], length: number, path: string, i: number) => {
    return (
      <BreadcrumbItem
        key={path}
        title={path === "/fs" ? this.props.homeTitle : path}
        active={!(i !== (length - 1))}
        showArrow={i !== (length - 1)}
        onClick={this.handlePathOnClick(paths.slice(0, i).join("/"))}
      />
    )
  }

  handlePathOnClick = (path: string) => () => this.props.onPathClick(`/fs/${path}`)
}

interface BreadcrumbItemProps {
  title: string
  active: boolean
  showArrow?: boolean
  onClick?(): void
}

export function BreadcrumbItem({ title, active, onClick, showArrow = false }: BreadcrumbItemProps) {
  const classes = classNames({
    [styles.breadcrumbTitle]: true,
    [styles.enabled]: !!onClick,
    [styles.active]: active,
  })
  return (
    <div className={styles.breadcrumbItem} onClick={onClick}>
      <div className={classes}>{title}</div>
      {showArrow ? <ArrowRightIcon color="#6F6F6F" /> : null}
    </div>
  )
}
