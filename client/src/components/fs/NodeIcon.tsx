import React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import DirectoryIcon from '@material-ui/icons/Folder'
import MultiplesIcon from '@material-ui/icons/FilterNone'
import FileIcon from '@material-ui/icons/InsertDriveFile'
import classnames from 'classnames'

import { FsNode, isDirectory } from 'models/FsNode'


const styles = (theme: Theme) => createStyles({
  root: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginRight: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit
  },
  selected: {
    color: theme.palette.primary.light
  }
})


type Props = {
  node: FsNode
  selected?: boolean
} & WithStyles<typeof styles>

function NodeIcon(props: Props) {
  const { node, selected, classes } = props

  return (
    <span className={ classnames(classes.root, { [classes.selected]: selected }) } >
    {
      isDirectory(node) ?
      <DirectoryIcon /> :
      <FileIcon />
    }
    </span>
  )

}


type ModesProps = {
  selected?: boolean
} & WithStyles<typeof styles>

function NodesIconComponent(props: ModesProps) {
  const { selected, classes } = props

  return (
    <span className={ classnames(classes.root, { [classes.selected]: selected }) } >
    {
      <MultiplesIcon />
    }
    </span>
  )

}

export const NodesIcon = withStyles(styles)(NodesIconComponent)

export default withStyles(styles)(NodeIcon)
