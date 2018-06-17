import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import * as React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import MenuIcon from '@material-ui/icons/Menu'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import DirectoryIcon from '@material-ui/icons/Folder'
import FileIcon from '@material-ui/icons/InsertDriveFile'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Divider from '@material-ui/core/Divider'
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions'
import Chip from '@material-ui/core/Chip'
import { distanceInWords } from 'date-fns'

import withRoot from '../elements/utils/withRoot'
import { FsNode } from '../models/FsNode';
import { Select } from '@material-ui/core';
import { ApiUtils } from '../services/api';

const styles = (theme: Theme) => createStyles({
  root: {
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
    flexDirection: 'row',
    //overflow: 'auto'
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
    heigh: 200,
    width: 200,
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
    display: 'inline',
    [theme.breakpoints.down('xs')]: {
      display: 'block'
    }
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
  fsNode: FsNode
  selected: boolean
  onSelected: (node: FsNode) => void
  onDeselected: (node: FsNode) => void
  onClicked: (node: FsNode) => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  expanded: boolean
}

class FileListElement extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle){
    super(props)
    this.state = {
      expanded: false
    }
  }

  expand() {
    this.setState({ ...this.state, expanded: !this.state.expanded })
  }

  toggleSelect() {
    if(this.props.selected)
      this.props.onDeselected(this.props.fsNode)
    else
      this.props.onSelected(this.props.fsNode)
  }

  onClicked() {
    this.props.onClicked(this.props.fsNode)
  }

  render() {
    const { classes, fsNode, selected } = this.props
    const now = new Date()

    const expandIcon =
      <span onClick={() => this.expand()} className={classes.button} ><ExpandMoreIcon/></span>
    
    const icon =
      fsNode.nodeType === 'DIRECTORY' ?
        <DirectoryIcon onClick={() => this.toggleSelect()} color={selected ? 'primary' : 'inherit'}/> :
        <FileIcon onClick={() => this.toggleSelect()} color={selected ? 'primary' : 'inherit'}/>

    const title = 
        <Typography
          onClick={fsNode.nodeType === 'DIRECTORY' ? () => this.onClicked() : undefined}
          color={selected ? 'primary' : 'inherit'}
          className={selected ? classes.headingSelected : classes.heading}
        >
          {fsNode.name}
        </Typography>

    const preview =
      fsNode.nodeType == 'FILE' && fsNode.hasThumbnail ?
      <div className={classes.columnImage}>
        <img className={classes.previewImage} src={`${ApiUtils.urlBase}/api/thumbnail/${fsNode.path}`} />
      </div> :
      <div/>

    const details = (() => {
      if(fsNode.nodeType == 'FILE')
        return [
          <div className={classes.columnInner} key={'file_info_1'} >
            <Typography variant="caption">
              <div className={classes.info}>{'Taille du fichier :'}</div>
              <div className={classes.info}>{`${fsNode.humanReadableSize}`}</div>
            </Typography>
            <br/>
            <Typography variant="caption">
              <div className={classes.info}>{'Création :'}</div>
              <div className={classes.info}>{`${distanceInWords(new Date(fsNode.creation), now)}`}</div>
            </Typography>
            <br/>
            <Typography variant="caption">
              <div className={classes.info}>{'Modification :'}</div>
              <div className={classes.info}>{`${distanceInWords(new Date(fsNode.creation), now)}`}</div>
            </Typography>
          </div>,
          <div className={classes.columnInner} key={"file_info_2"}>
            <Typography variant="caption">
              <div className={classes.info}>{'Type de fichier :'}</div>
              <div className={classes.info}>{`${fsNode.mimeType}`}</div> 
            </Typography>
            <br/>
            <Typography variant="caption">
              <div className={classes.info}>{'Compression :'}</div>
              <div className={classes.info}>{`${fsNode.compression ? fsNode.compression : 'aucune'}`} </div>
            </Typography>
            <br/>
            <Typography variant="caption">
              <div className={classes.info}>{'Chiffrement :'}</div>
              <div className={classes.info}>{`${fsNode.cipher ? fsNode.cipher : 'aucun'}`}</div>
            </Typography>
          </div>
        ]
      else
        return [
          <div className={classes.columnInner} key={"dir_info_1"}>
            <Typography variant="caption">
              {`Création : ${distanceInWords(new Date(fsNode.creation), now)}`}
            </Typography>
            <br/>
            <Typography variant="caption">
              {`Modification : ${distanceInWords(new Date(fsNode.creation), now)}`}
            </Typography>
          </div>,
          <div className={classes.columnInner} key={"dir_info_2"}>
          
          </div>
        ]
    })()
       
    return (
      <ExpansionPanel expanded={this.state.expanded} >
        <ExpansionPanelSummary expandIcon={expandIcon} >
        {icon}
        {title}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails  className={classes.root}>
          {preview}
          <div className={classes.column}>

            <div className={classes.row}>
            {details}
            </div>
            <div className={classes.columnInner}>
              <div>
                <Chip className={classes.chip} label={'Some tag'} key={1} />
                <Chip className={classes.chip} label={'Some tag'} key={2} />
                <Chip className={classes.chip} label={'Some tag'} key={3} />
                <Chip className={classes.chip} label={'Some tag'} key={4} />
              </div>
            </div>
          </div>
        </ExpansionPanelDetails>
        <Divider />
        <ExpansionPanelActions>
          <Button size="small">Delete</Button>
          <Button size="small">Move</Button>
          <Button size="small" color="primary">Share</Button>
          <Button size="small" color="primary">Download</Button>
        </ExpansionPanelActions>
      </ExpansionPanel>
    )
  }
}

export default withStyles(styles) <PropsWithStyle> (FileListElement)
