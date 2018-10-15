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

import styles from './styles'


interface Props {
  path: string
  className: string
  onPathSelected: (path: string) => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

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

  onPathSelected(path: string) {
    this.props.onPathSelected(path)
  }

  render() {
    const { path, className } = this.props
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
      useLarge ?
      <div className={className} ref={(el) => {this.ref = el}}><FullSizeBreadCrumbWithStyle path={paths} onPathSelected={(path) => this.onPathSelected(path)} /></div> :
      <div className={className}><LowSizeBreadCrumbWithStyle path={paths} onPathSelected={(path) => this.onPathSelected(path)} /></div>
    )
  }

}

type InnerProps = {
  path: { name: string, path: string }[]
  onPathSelected: (path: string) => void
} & WithStyles<typeof styles>

class LowSizeBreadCrumb extends React.Component<InnerProps, { anchorEl: HTMLElement | null }> {

  constructor(props: InnerProps) {
    super(props)

    this.state = {
      anchorEl: null
    }
  }

  onPathSelected(path: string) {
    this.props.onPathSelected(path)
    this.onCloseMenu()
  }

  onOpenMenu(event: React.MouseEvent<HTMLElement>) {
    this.setState({ anchorEl: event.currentTarget })
  }

  onCloseMenu() {
    this.setState({ anchorEl: null })
  }

  render() {
    const { path, classes, onPathSelected } = this.props
    const anchorEl = this.state.anchorEl

    const lastPath = path[path.length - 1] || ''
    const pathWithoutLast = path.slice(0, path.length - 1)
    
    return (
      <div className={classes.root}>
        <Button className={classnames(classes.homeButton, classes.button)} onClick={(e) => this.onOpenMenu(e)} >
          <DropDownIcon className={classes.icon} />
        </Button>
        <RightIcon className={classes.icon} />
        <Tooltip title={lastPath.name || ''} classes={{ tooltip: classes.tooltip }} enterDelay={500} >
          <Button className={classes.button} onClick={() => onPathSelected(lastPath.path)} >
            <span className={classes.shortName}>{lastPath.name}</span>
          </Button>
        </Tooltip>
        <Menu
          PaperProps={{ style: { maxWidth: 400, } }}
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => { this.onCloseMenu() }}
        >
          <MenuItem key="/" onClick={() => this.onPathSelected('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText>
              {'Dossier racine'}
            </ListItemText>
          </MenuItem>
          {
            pathWithoutLast.map((directory) => (
              <MenuItem key={directory.path + '/' + directory.name} onClick={() => this.onPathSelected(directory.path)}>
                <ListItemIcon>
                  <DirectoryIcon />
                </ListItemIcon>
                <ListItemText>
                  <Tooltip title={directory.name} classes={{ tooltip: classes.tooltip }} enterDelay={500} >
                    <div className={classes.shortName} >
                      {directory.name}
                    </div>
                  </Tooltip>
                </ListItemText>
              </MenuItem>
            ))
          }
        </Menu>
      </div>
    )
  }

}

const LowSizeBreadCrumbWithStyle = withStyles(styles)(LowSizeBreadCrumb)

class FullSizeBreadCrumb extends React.Component<InnerProps & WithStyles<typeof styles>> {

  onPathSelected(path: string) {
    this.props.onPathSelected(path)
  }

  render() {
    const { path, classes } = this.props

    return (
      <div className={classes.root}>
        <Button className={classnames(classes.homeButton, classes.button)} onClick={() => this.onPathSelected('/')} >
          <HomeIcon className={classes.icon} />
        </Button>
        {
          path.map((directory) => (
            <div className={classes.element} key={directory.path} >
              <RightIcon className={classes.icon} />
              <Button className={classes.button} onClick={() => this.onPathSelected(directory.path)} >
                {directory.name}
              </Button>
            </div>
          ))
        }
      </div>
    )
  }

}

const FullSizeBreadCrumbWithStyle = withStyles(styles)(FullSizeBreadCrumb)

export default withStyles(styles)(BreadCrumb)
