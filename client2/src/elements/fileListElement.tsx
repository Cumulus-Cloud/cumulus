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
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Divider from '@material-ui/core/Divider'
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions'
import Chip from '@material-ui/core/Chip'

import withRoot from '../withRoot'

const styles = (theme: Theme) => createStyles({
  root: {
    textAlign: 'center',
    paddingTop: 110
  },
  appbarRoot: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  tableRoot: {
    width: '100%',
    maxWidth: 800,
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  pathRoot: theme.mixins.gutters({
    width: '100%',
    maxWidth: 800,
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    marginRight: 'auto',
    marginLeft: 'auto'
  }),
  testRoot: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    maxWidth: 800,
    marginRight: 'auto',
    marginLeft: 'auto'
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
  },
  columnInner: {
    paddingTop: 3,
    padding: 20,
    flexGrow: 1
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
    marginRight: 5
  }
})

type FileType = 'directory' | 'file'

interface Props {
  type: FileType
  filename: string
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  expanded: boolean
  selected: boolean
}

class FileListElement extends React.Component<PropsWithStyle, State> {

  constructor(props: Props & WithStyles<typeof styles>){
    super(props)
    this.state = {
      selected: false,
      expanded: false
    }
  }

  expand() {
    this.setState({ ...this.state, expanded: !this.state.expanded })
  }

  select() {
    this.setState({ ...this.state, selected: !this.state.selected })
  }

  render() {
    const expandIcon =
      <span onClick={() => this.expand()} className={this.props.classes.button} ><ExpandMoreIcon/></span>
    
    const icon =
      this.state.selected ?
        <Icon onClick={() => this.select()} color="primary" >{this.props.type === 'directory' ? 'folder' : 'insert_drive_file'}</Icon> :
        <Icon onClick={() => this.select()} >{this.props.type === 'directory' ? 'folder' : 'insert_drive_file'}</Icon>

    const title = 
      this.state.selected ?
        <Typography onClick={() => this.select()} color="primary" className={this.props.classes.headingSelected}>{this.props.filename}</Typography> :
        <Typography onClick={() => this.select()} className={this.props.classes.heading}>{this.props.filename}</Typography>

      console.log(this.state.expanded)
      console.log(this.state.selected)

    return (
      <ExpansionPanel expanded={this.state.expanded} >
        <ExpansionPanelSummary expandIcon={expandIcon} >
          {icon}
          {title}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {
            this.props.type == 'file' ?
            <div className={this.props.classes.columnImage}>
              <img src="https://blog.addthiscdn.com/wp-content/uploads/2016/03/01125908/200-200-pixels.png" />
            </div> :
            <div/>
          }
          <div className={this.props.classes.column}>

            <div className={this.props.classes.columnInner}>
              <div className={this.props.classes.row}>
                <div className={this.props.classes.columnInner}>
                  <Typography variant="caption">
                    Size of the file: 12Mo
                  </Typography>
                  <br/>
                  <Typography variant="caption">
                    Creation: 3 days ago
                  </Typography>
                  <br/>
                  <Typography variant="caption">
                    Modification: 2 days ago
                  </Typography>
                </div>
                <div className={this.props.classes.columnInner}>
                  <Typography variant="caption">
                    Size of the file: 12Mo
                  </Typography>
                  <br/>
                  <Typography variant="caption">
                    Creation: 3 days ago
                  </Typography>
                  <br/>
                  <Typography variant="caption">
                    Modification: 2 days ago
                  </Typography>
                </div>
              </div>
            </div>
            <div className={this.props.classes.columnInner}>
              <Chip label="Barbados" className={this.props.classes.chip} onDelete={() => {}} />
              <Chip label="Barbados" className={this.props.classes.chip} onDelete={() => {}} />
              <Chip label="Barbados" className={this.props.classes.chip} onDelete={() => {}} />
              <Chip label="Barbados" className={this.props.classes.chip} onDelete={() => {}} />
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
