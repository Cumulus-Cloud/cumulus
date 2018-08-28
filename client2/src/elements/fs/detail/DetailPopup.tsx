import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import Typography from '@material-ui/core/Typography'
import DirectoryIcon from '@material-ui/icons/Folder'
import FileIcon from '@material-ui/icons/InsertDriveFile'
import Chip from '@material-ui/core/Chip'
import { WithWidthProps } from '@material-ui/core/withWidth'
import { distanceInWords } from 'date-fns'

import { withStore } from '../../../index'
import { togglePopup, isSelected } from '../../../actions/popup/popupActions'
import { ApiUtils } from '../../../services/api'
import { FsNode } from '../../../models/FsNode'

const styles = (theme: Theme) => createStyles({
  root: {
    maxWidth: 700
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  details: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column'
    }
  },
  heading: {
    paddingLeft: 15,
    paddingTop: 2,
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  headingSelected: {
    paddingLeft: 15,
    paddingTop: 2,
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  button: {
    width: 50,
    height: 45,
    marginTop: 20,
    display: 'block'
  },
  column: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  row: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row'
  },
  columnImage: {
    flexBasis: 200,
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
      paddingBottom: theme.spacing.unit * 2
    }
  },
  previewImage: {
    border: '1px solid rgba(0, 0, 0, 0.12)',
    height: 200,
    width: 200
  },
  columnInner: {
    paddingTop: 3,
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.down('xs')]: {
      padding:  theme.spacing.unit
    },
    flexGrow: 1,
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
  info: {
    display: 'inline'
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  chip: {
    marginRight: 5,
    marginTop: 2
  }
})

interface Props {
  onClose: () => void
  onDownload: () => void
  onDelete: () => void
  onShare: () => void
  open: boolean
  fullScreen?: boolean
  loading: boolean
  node?: FsNode
  error?: Error
}

type PropsWithStyle = Props & WithStyles<typeof styles> & Partial<WithWidthProps>

interface State {}

class DetailsPopup extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = {}
  }

  onClose() {
    this.props.onClose()
  }

  onDownload() {
    this.props.onDownload()
  }

  onDelete() {
    this.props.onDelete()
  }

  onShare() {
    this.props.onShare()
  }
  

  render() {
    const { classes, fullScreen, node, open, error, loading } = this.props
  
    if(node) {

      const now = new Date()

      const icon =
        node.nodeType === 'DIRECTORY' ?
          <DirectoryIcon/> :
          <FileIcon/>

      const title = 
          <Typography className={classes.heading}>
            {node.name}
          </Typography>

      const preview =
        node.nodeType == 'FILE' && node.hasThumbnail ?
        <div className={classes.columnImage}>
          <img className={classes.previewImage} src={`${ApiUtils.urlBase}/api/fs/${node.id}/thumbnail`} />
        </div> :
        <div/>

      const details =
        node.nodeType == 'FILE' ?
          [
            <div className={classes.columnInner} key={'file_info_1'} >
              <Typography variant="caption">
                <div className={classes.info}>{'Taille du fichier :'}</div>
                <div className={classes.info}>{`${node.humanReadableSize}`}</div>
              </Typography>
              <br/>
              <Typography variant="caption">
                <div className={classes.info}>{'Création :'}</div>
                <div className={classes.info}>{`${distanceInWords(new Date(node.creation), now)}`}</div>
              </Typography>
              <br/>
              <Typography variant="caption">
                <div className={classes.info}>{'Modification :'}</div>
                <div className={classes.info}>{`${distanceInWords(new Date(node.creation), now)}`}</div>
              </Typography>
            </div>,
            <div className={classes.columnInner} key={"file_info_2"}>
              <Typography variant="caption">
                <div className={classes.info}>{'Type de fichier :'}</div>
                <div className={classes.info}>{`${node.mimeType}`}</div> 
              </Typography>
              <br/>
              <Typography variant="caption">
                <div className={classes.info}>{'Compression :'}</div>
                <div className={classes.info}>{`${node.compression ? node.compression : 'aucune'}`} </div>
              </Typography>
              <br/>
              <Typography variant="caption">
                <div className={classes.info}>{'Chiffrement :'}</div>
                <div className={classes.info}>{`${node.cipher ? node.cipher : 'aucun'}`}</div>
              </Typography>
            </div>
          ] : [
            <div className={classes.columnInner} key={"dir_info_1"}>
              <Typography variant="caption">
                {`Création : ${distanceInWords(new Date(node.creation), now)}`}
              </Typography>
              <br/>
              <Typography variant="caption">
                {`Modification : ${distanceInWords(new Date(node.creation), now)}`}
              </Typography>
            </div>,
            <div className={classes.columnInner} key={"dir_info_2"}>
            
            </div>
          ]

      // TODO PaperProps={{ className: classes.root }}

      return (
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={() => this.onClose()}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            {`Détails de ${node.name}`}
          </DialogTitle>
          <DialogContent>
            <div className={classes.details}>
              {preview}
              <div className={classes.column}>
                <div className={classes.row}>
                {details}
                </div>
                <div className={classes.columnInner}>
                  <div>
                    <Chip className={classes.chip} label={'Some tag 1'} key={1} />
                    <Chip className={classes.chip} label={'Some tag 2'} key={2} />
                    <Chip className={classes.chip} label={'Some tag 3'} key={3} />
                    <Chip className={classes.chip} label={'Some tag 4'} key={4} />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button size="small">Delete</Button>
            <Button size="small">Move</Button>
            <Button size="small" color="primary">Share</Button>
            <Button size="small" color="primary">Download</Button>
          </DialogActions>
        </Dialog>
      )
    } else 
      return <span/>
  }

}

const DetailsPopupWithStyle = withStyles(styles) <PropsWithStyle> (withMobileDialog<PropsWithStyle> ({ breakpoint: 'xs' })(DetailsPopup))

const CreationPopupWithContext = () => (
  withStore(ctx => {
    const state = ctx.state
    const router = state.router

    const selection = isSelected('NODE_DETAILS')(router.location)
      
    // TODO handle pagination (ask for specific file reload)
    const node = state.fs.detailed || (state.fs.content || []).find((n) => n.name === selection.param)

    return (
      <DetailsPopupWithStyle
        open={selection.selected}
        loading={state.createDirectory.loading}
        node={node}
        onClose={() => {
          togglePopup('NODE_DETAILS', false)(router)
        }}
        onDownload={() => {
          console.log('TODO onDownload')
        }}
        onDelete={() => {
          console.log('TODO onDelete')
        }}
        onShare={() => {
          console.log('TODO onDownload')
        }}
      />
    )
  })
)

export default CreationPopupWithContext
