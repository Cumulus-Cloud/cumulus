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

import withRoot from '../withRoot'
/*
import ButtonAppBar from '../components/app-bar'
import withRoot from '../withRoot'
import AnomalyList from './anomaly-list'
import AnomalyDetail from './anomaly-detail'
import ClientsList from './client-list'
*/


const Home = () => (
<div>
    <h2>Home</h2>
    <Link to="/about">
        About
    </Link>
</div>
);
  
const About = () => (
<div>
    <h2>About</h2>
    <Link to="/">
        Go back
    </Link>
</div>
);

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
})

interface Props extends WithStyles<typeof styles> {}

class Index extends React.Component<Props, {}> {

  render() {

    let id = 0
    function createData(name: string, calories: number, fat: number, carbs: number, protein: number) {
      id += 1
      return { id, name, calories, fat, carbs, protein }
    }

    const data = [
      createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
      createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
      createData('Eclair', 262, 16.0, 24, 6.0),
      createData('Cupcake', 305, 3.7, 67, 4.3),
      createData('Gingerbread', 356, 16.0, 49, 3.9),
    ]

    return (
      <Router>
        <div>
          <div className={this.props.classes.appbarRoot}>
            <AppBar position="static">
              <Toolbar>
                <IconButton className={this.props.classes.menuButton} color="inherit" aria-label="Menu">
                    <MenuIcon />
                </IconButton>
                <Typography variant="title" color="inherit" className={this.props.classes.flex}>
                    Cumulus
                </Typography>
                <IconButton color="inherit"><AccountCircle /></IconButton>
              </Toolbar>
            </AppBar>
          </div>

          <div>
            <Paper className={this.props.classes.pathRoot} elevation={4}>
              <Typography component="p">
                /aaaa/bbbb/cccc/ddd
              </Typography>
            </Paper>
          </div>

          {
            // TODO 
          }
          <div className={this.props.classes.testRoot}>
            <ExpansionPanel onClick={(e) => console.log(e)} expanded={false} >
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Icon>insert_drive_file</Icon>
                <Typography className={this.props.classes.heading}>some image.jpg</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                  sit amet blandit leo lobortis eget.
                </Typography>
              </ExpansionPanelDetails>
              <Divider />
              <ExpansionPanelActions>
                <Button size="small">Delete</Button>
                <Button size="small">Move</Button>
                <Button size="small" color="primary">Share</Button>
                <Button size="small" color="primary">Download</Button>
              </ExpansionPanelActions>
            </ExpansionPanel>


            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Icon>insert_drive_file</Icon>
                <Typography className={this.props.classes.heading}>Expansion Panel 2</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                  sit amet blandit leo lobortis eget.
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Icon>folder</Icon>
                <Typography className={this.props.classes.heading}>Expansion Panel 2</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                  sit amet blandit leo lobortis eget.
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Icon>folder</Icon>
                <Typography className={this.props.classes.heading}>Expansion Panel 2</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                  sit amet blandit leo lobortis eget.
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>

          <Paper className={this.props.classes.tableRoot}>
            <Table className={this.props.classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Dessert (100g serving)</TableCell>
                  <TableCell numeric>Calories</TableCell>
                  <TableCell numeric>Fat (g)</TableCell>
                  <TableCell numeric>Carbs (g)</TableCell>
                  <TableCell numeric>Protein (g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map(n => {
                  return (
                    <TableRow key={n.id}>
                      <TableCell component="th" scope="row">
                        {n.name}
                      </TableCell>
                      <TableCell numeric>{n.calories}</TableCell>
                      <TableCell numeric>{n.fat}</TableCell>
                      <TableCell numeric>{n.carbs}</TableCell>
                      <TableCell numeric>{n.protein}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
          <div className={this.props.classes.root}>

            <Route exact path="/" component={Home}/>
            <Route exact path="/about" component={About}/>
          </div>
        </div>
      </Router>
    )
  }
}

export default withRoot(withStyles(styles) < {} > (Index))

/*


          <div>
            <Paper className={this.props.classes.pathRoot} elevation={4}>
              <Typography variant="headline" component="h3">
                This is a sheet of paper.
              </Typography>
              <Typography component="p">
                Paper can be used to build surface or other elements for your application.
              </Typography>
            </Paper>
          </div>

      */
