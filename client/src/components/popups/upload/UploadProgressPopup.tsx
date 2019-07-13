import  React from 'react'
import { withStyles, Theme, WithStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CloseIcon from '@material-ui/icons/Close'
import { LinearProgress } from '@material-ui/core'
import Collapse from '@material-ui/core/Collapse'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import createStyles from '@material-ui/core/styles/createStyles'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import FileDownloadButton from '@material-ui/icons/CloudDownload'
import List from '@material-ui/core/List'
import Slide from '@material-ui/core/Slide'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import classnames from 'classnames'

import { useFileUpload } from 'store/store'
import { computeUploadingSpeed } from 'store/states/fileUploadState'

import { humanSpeed } from 'utils/humandReadable'


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
    height: 63
  },
  headerText: {
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.pxToRem(15)
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
      width: theme.spacing()
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
    marginRight: 36
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


type PropsWithStyle = WithStyles<typeof styles>


function UploadProgressPopup(props: PropsWithStyle) {

  const [expanded, setExpanded] = React.useState(false)

  const { showUploadInProgress, uploading, hideUploadProgress } = useFileUpload()

  function toggleExpand() {
    setExpanded(!expanded)
  }

  const { classes } = props
  // TODO show error

  const uploadsInprogess = uploading.filter((f) => f.loading).length
  const uploadsTerminated = uploading.length - uploadsInprogess

  const uploadsInfo = uploading.map((upload) => {
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
                <Typography className={classes.downloadSpeed} variant="caption" >
                  {humanSpeed(computeUploadingSpeed(upload), 's')}
                </Typography>
              )
            }
          </ListItemText>
        </ListItem>
        <Divider />
      </span>
    )
  })

  return (
    <Slide direction="up" in={showUploadInProgress} mountOnEnter unmountOnExit>
      <div className={classes.root} >
        <Card className={classes.card}>

          <CardHeader
            className={classes.header}
            color="white"
            action={
              <div>
              <IconButton
                className={classnames(classes.expand, classes.headerButton, { [classes.expandOpen]: expanded })}
                onClick={toggleExpand}
                aria-expanded={expanded}
                aria-label="Show more"
              >
                <ExpandMoreIcon />
              </IconButton>
              <IconButton className={classes.headerButton} disabled={uploadsInprogess !== 0} onClick={hideUploadProgress} >
                <CloseIcon />
              </IconButton>
              </div>
            }
            title={<span className={classes.headerText}>{uploadsInprogess} uploads en cours, {uploadsTerminated} uploads terminés</span>}
          />

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent className={classes.content} style={{ padding: 0 }} >
              <List component="nav" style={{ padding: 0 }} >
                {uploadsInfo}
              </List>
            </CardContent>
          </Collapse>
        </Card>
      </div>
    </Slide>
  )

}


export default withStyles(styles)(UploadProgressPopup)
