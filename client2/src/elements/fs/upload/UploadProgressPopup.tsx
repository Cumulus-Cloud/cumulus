import * as React from 'react'
import { withStyles, Theme, WithStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import createStyles from '@material-ui/core/styles/createStyles'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import FileDownloadButton from '@material-ui/icons/FileDownload'
import FileButton from '@material-ui/icons/InsertDriveFile'
import classnames from 'classnames'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import CloseIcon from '@material-ui/icons/Close';
import Collapse from '@material-ui/core/Collapse';
import { LinearProgress } from '@material-ui/core';
import { FileUploadingState, computeUploadingSpeed } from '../../../actions/fs/fileUpload/fileUploadState';
import { humanSpeed } from '../../../services/utils';

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    [theme.breakpoints.down('xs')]: {
      bottom: 0,
      right: 0,
      width: '100%'
    }
  },
  header: {
    backgroundColor: theme.palette.primary.main,
    height: 60
  },
  headerText: {
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.pxToRem(18)
  },
  headerButton: {
    color: theme.palette.primary.contrastText
  },
  expand: {
    transform: 'rotate(180deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    }),
    marginLeft: 'auto'
  },
  expandOpen: {
    transform: 'rotate(0deg)',
  },
  content: {
    padding: 0,
    paddingBottom: 0,
    minHeight: 0,
    maxHeight: 250,
    overflowY: 'scroll',
    ['&::-webkit-scrollbar']: {
      width: theme.spacing.unit
    },
    ['&::-webkit-scrollbar-track']: {
      background: theme.palette.background.paper
    },
    ['&::-webkit-scrollbar-thumb']: {
      background: '#CCC'
    },
    ['&::-webkit-scrollbar-thumb:hover']: {
      background: '#BBB'
    }
  },
  card: {
    minWidth: 400,
  },
  fileItem: {
    height: 70
  },
  fileIcon: {
    flex: 0,
    marginRight: 13
  },
  downloadSpeed: {
    textAlign: 'right'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)'
  },
  title: {
    marginBottom: 16,
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
})

interface Props {
  onClose: () => void
  files: FileUploadingState[]
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  expanded: boolean
}

class UploadProgressPopup extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { expanded: true }
  }

  handleExpandClick() {
    this.setState({ expanded: !this.state.expanded })
  }

  render() {
    const { classes, files } = this.props

    // TODO show error

    const uploadsInfo = files.map((upload) => {
      // TODO better ID
      return (
        <span key={upload.file.id} >
          <ListItem button className={classes.fileItem} >
            <ListItemText className={classes.fileIcon} >
              <FileDownloadButton />
            </ListItemText>
            <ListItemText>
              {upload.file.filename}
              {
                upload.loading && (
                  upload.progress < 100 ?
                  <LinearProgress variant="determinate" value={upload.progress} /> :
                  <LinearProgress variant="indeterminate" />
                )
              }
              {
                (upload.loading && upload.progress < 100) && (
                  <Typography className={classes.downloadSpeed} variant="caption" >{humanSpeed(computeUploadingSpeed(upload), 's')}</Typography>
                )
              }
            </ListItemText>
          </ListItem>
          <Divider />
        </span>
      )
    })

    return (
      <div className={classes.root} >
        <Card className={classes.card}>

          <CardHeader
            className={classes.header}
            color="white"
            action={
              <div>
              <IconButton
                className={classnames(classes.expand, classes.headerButton, {
                  [classes.expandOpen]: this.state.expanded,
                })}
                onClick={() => this.handleExpandClick()}
                aria-expanded={this.state.expanded}
                aria-label="Show more"
              >
                <ExpandMoreIcon />
              </IconButton>
              <IconButton className={classes.headerButton} >
                <CloseIcon />
              </IconButton>
              </div>
            }
            title={<span className={classes.headerText}>2 uploads en cours</span>}
          />
          
          <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
            <CardContent className={classes.content} style={{ padding: 0 }} >
              <List component="nav" style={{ padding: 0 }} >
                {uploadsInfo}
              </List>
            </CardContent>
          </Collapse>
        </Card>
      </div>
    )
  }

}

export default withStyles(styles)(UploadProgressPopup)
