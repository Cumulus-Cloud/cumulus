import Button from '@material-ui/core/Button'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import HomeIcon from '@material-ui/icons/Home'
import RightIcon from '@material-ui/icons/KeyboardArrowRight'
import * as React from 'react'


const styles = (theme: Theme) => createStyles({
  root: {
    width: '100%',
    maxWidth: 800,
    paddingLeft: theme.spacing.unit * 3,
    //marginBottom: theme.spacing.unit * 2,
    height: '70px',
    display: 'flex',
    overflow: 'auto'
  },
  element: {
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center'
  },
  homeButton: {
    marginLeft:  theme.spacing.unit * -2,
    minWidth: 0
  }
})

interface Props {
  path: string
  onPathSelected: (path: string) => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {}

/**
 * Bread crumbs component to decompose a given path into a serie of
 * button to navigate in each element of the path.
 */
class BreadCrumb extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
  }

  onPathSelected(path: string) {
    this.props.onPathSelected(path)
  }

  render() {
    const { path } = this.props

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
      <div>
        <div className={this.props.classes.root}>
          <Button className={this.props.classes.homeButton} onClick={() => this.onPathSelected('/')} >
            <HomeIcon/>
          </Button>
          {
            paths.map((path) => {
              return (
                <div className={this.props.classes.element} key={path.path} >
                  <RightIcon/>
                  <Button onClick={() => this.onPathSelected(path.path)} >
                    {path.name}
                  </Button>
                </div>
              )
            })
          }
          <div style={{ flexGrow: 1 }} />
        </div>
      </div>
    )
  }

}

export default withStyles(styles) <PropsWithStyle> (BreadCrumb)
