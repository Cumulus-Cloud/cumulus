import  React from 'react'

import Button from '@material-ui/core/Button'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import HomeIcon from '@material-ui/icons/Home'
import RightIcon from '@material-ui/icons/KeyboardArrowRight'
import DropDownIcon from '@material-ui/icons/ArrowDropDownCircle'
import DirectoryIcon from '@material-ui/icons/Folder'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'
import classnames from 'classnames'

import { connect, withStore } from 'store/store'
import { getDirectory } from 'store/actions/directory'
import { moveNodes } from 'store/actions/nodeDisplacement'

import { WithDragAndDrop, dragAndDropPropsOpt } from 'components/utils/DragAndDrop'

import { FsNode } from 'models/FsNode'

import Routes from 'services/routes'

import styles from './styles'


interface Props {
  path: string
  selected?: string
  onChangePath: (path: string) => void
  onMoveNodes?: (nodes: FsNode[], destination: string) => void
}

type PropsWithStyle = Props & WithStyles<typeof styles> & Partial<WithDragAndDrop<FsNode[]>>

interface State {
  useLarge: boolean
  checked: boolean
}

/**
 * Bread crumbs component to decompose a given path into a serie of
 * button to navigate in each element of the path.
 */
class BreadCrumb extends React.Component<PropsWithStyle, State> {

  ref?: HTMLElement | null

  constructor(props: PropsWithStyle) {
    super(props)

    this.state = {
      useLarge: true,
      checked: false
    }
  }

  onResize() {
    this.setState({ checked: false, useLarge: true })
  }

  componentDidMount() {
    window.addEventListener("resize", () => this.onResize())
  }

  componentWillUnmoun() {
    window.removeEventListener("resize", () => this.onResize())
  }

  componentDidUpdate(prevProps: Props) {
    const ref = this.ref

    if(this.props.path !== prevProps.path) {
      this.setState({ checked: false, useLarge: true })
    }

    if(ref && !this.state.checked) {
      const hasOverflowingChildren = ref.offsetHeight < ref.scrollHeight || ref.offsetWidth < ref.scrollWidth
      this.setState({ checked: true, useLarge: !hasOverflowingChildren })
    }
  }

  render() {
    const { path, selected, classes, onChangePath, onMoveNodes } = this.props
    const { useLarge } = this.state

    const elements =
      path.split('/').filter((p) => p !== '')

    const paths =
      elements.slice().reduce((acc, name, index) => {
        return acc.concat({
          name: name,
          path: '/' + (index == 0 ? name : elements.slice(0, index).join('/') + '/' + name)
        })
      }, [] as { name: string, path: string }[])

    return (
      useLarge ? (
        <div className={ classes.breadCrumb } ref={(el) => {this.ref = el}}>
          <FullSizeBreadCrumbWithStyle path={paths} selected={selected} onChangePath={onChangePath} onMoveNodes={onMoveNodes} {...dragAndDropPropsOpt(this.props)} />
        </div>
      ) : (
        <div className={ classes.breadCrumb }>
          <LowSizeBreadCrumbWithStyle path={paths} selected={selected} onChangePath={onChangePath} onMoveNodes={onMoveNodes} {...dragAndDropPropsOpt(this.props)} />
        </div>
      )
    )
  }

}


type InnerProps = {
  path: { name: string, path: string }[]
  selected?: string
  onChangePath: (path: string) => void
  onMoveNodes?: (nodes: FsNode[], destination: string) => void
} & WithStyles<typeof styles> & Partial<WithDragAndDrop<FsNode[]>>

class LowSizeBreadCrumb extends React.Component<InnerProps, { anchorEl: HTMLElement | null }> {

  constructor(props: InnerProps) {
    super(props)

    this.state = {
      anchorEl: null
    }
  }

  onChangePath(path: string) {
    this.props.onChangePath(path)
    this.onCloseMenu()
  }

  onMoveNodes(nodes: FsNode[], destination: string)  {
    this.props.onMoveNodes && this.props.onMoveNodes(nodes, destination)
    this.onCloseMenu()
  }

  onOpenMenu(event: React.MouseEvent<HTMLElement>) {
    this.setState({ anchorEl: event.currentTarget })
  }

  onCloseMenu() {
    this.setState({ anchorEl: null })
  }

  render() {
    const { path, selected, classes, onChangePath, DropZone } = this.props
    const anchorEl = this.state.anchorEl

    const lastPath = path[path.length - 1] || ''
    const pathWithoutLast = path.slice(0, path.length - 1)

    const menuButton = (
      <Button className={classnames(classes.homeButton, classes.button)} onClick={(e) => this.onOpenMenu(e)} >
        <DropDownIcon className={classes.icon} />
      </Button>
    )

    const rootButton = (
      <MenuItem onClick={() => this.onChangePath('/')}>
        <ListItemIcon>
          <HomeIcon className={ classnames({ [classes.selected]: selected === '/' }) } />
        </ListItemIcon>
        <ListItemText>
          {'Dossier racine'}
        </ListItemText>
      </MenuItem>
    )

    const directoryIcon = (directory: { name: string, path: string }) => (
      <MenuItem onClick={() => this.onChangePath(directory.path)} key={directory.path + '/' + directory.name} >
        <ListItemIcon>
          <DirectoryIcon className={ classnames({ [classes.selected]: selected === directory.path }) } />
        </ListItemIcon>
        <ListItemText>
          <Tooltip title={directory.name} classes={{ tooltip: classes.tooltip }} enterDelay={500} >
            <div className={ classnames(classes.shortName, { [classes.selected]: selected === directory.path }) } >
              {directory.name}
            </div>
          </Tooltip>
        </ListItemText>
      </MenuItem>
    )

    return (
      <div className={classes.root}>
        {
          DropZone ?
          <DropZone onDrop={() => {}} onDragOver={(_, e) => this.onOpenMenu(e)} >
             { menuButton }
          </DropZone> :
          menuButton
        }
        <RightIcon className={classes.icon} />
        <Tooltip title={lastPath.name || ''} classes={{ tooltip: classes.tooltip }} enterDelay={500} >
          <Button className={classes.button} onClick={() => onChangePath(lastPath.path)} >
            <span className={ classnames(classes.shortName, { [classes.selected]: selected === lastPath.path }) }>{lastPath.name}</span>
          </Button>
        </Tooltip>
        <Menu
          PaperProps={{ style: { maxWidth: 400, } }}
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => { this.onCloseMenu() }}
        >
          {
            DropZone ?
            <DropZone key="/" onDrop={(nodes) => this.onMoveNodes(nodes, '/')} >
              { rootButton }
            </DropZone> :
            rootButton
          }
          {
            DropZone ?
            pathWithoutLast.map((directory) => (
              <DropZone key={directory.path + '/' + directory.name} onDrop={(nodes) => this.onMoveNodes(nodes, directory.path)} >
                { directoryIcon(directory) }
              </DropZone>
            )) :
            pathWithoutLast.map((directory) =>
              directoryIcon(directory)
            )
          }
        </Menu>
      </div>
    )
  }

}

const LowSizeBreadCrumbWithStyle = withStyles(styles)(LowSizeBreadCrumb)


class FullSizeBreadCrumb extends React.Component<InnerProps> {

  onChangePath(path: string) {
    this.props.onChangePath(path)
  }

  onMoveNodes(nodes: FsNode[], destination: string)  {
    this.props.onMoveNodes && this.props.onMoveNodes(nodes, destination)
  }

  render() {
    const { path, selected, classes, DropZone } = this.props
    console.log(selected)

    const homeButton = (
      <Button className={ classnames(classes.homeButton, classes.button) } onClick={ () => this.onChangePath('/') } >
        <HomeIcon className={ classnames(classes.icon, { [classes.selected]: selected === '/' }) } />
      </Button>
    )

    const directoryButton = (directory: { name: string, path: string }) => (
      <Button className={  classnames(classes.button, { [classes.selected]: selected === directory.path }) } onClick={() => this.onChangePath(directory.path)} >
        { directory.name }
      </Button>
    )

    return (
      <div className={classes.root}>
        {
          DropZone ?
          <DropZone onDrop={(nodes) => this.onMoveNodes(nodes, '/')} >
            { homeButton }
          </DropZone> :
          homeButton
        }
        {
          DropZone ?
          path.map((directory) => (
            <div className={ classes.element } key={ directory.path } >
              <RightIcon className={ classes.icon } />
              <DropZone onDrop={ (nodes) => this.onMoveNodes(nodes, directory.path) } >
                { directoryButton(directory) }
              </DropZone>
            </div>
          )) :
          path.map((directory) => (
            <div className={ classes.element } key={ directory.path } >
              <RightIcon className={ classes.icon } />
              { directoryButton(directory) }
            </div>
          ))
        }
      </div>
    )
  }

}

const FullSizeBreadCrumbWithStyle = withStyles(styles)(FullSizeBreadCrumb)

export const BreadCrumb2 = withStyles(styles)(BreadCrumb)

const mappedProps =
  connect(({ fs, router }, dispatch) => ({
    path: (fs.current && fs.current.path) || '/',
    onChangePath: (path: string) => {
      router.push(`${Routes.app.fs}${path}${router.location.search}`) // TODO in an action
      dispatch(getDirectory(path))
    },
    onMoveNodes: (nodes: FsNode[], destination: string) => {
      dispatch(moveNodes({ nodes, destination }))
    }
  }))

export default withStore(withStyles(styles)(BreadCrumb), mappedProps)
