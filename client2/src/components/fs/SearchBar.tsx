import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchIcon from '@material-ui/icons/Search'
import { Search } from 'store/states/fsState'
import classnames from 'classnames'


const styles = (_: Theme) => createStyles({
  searchBarActive: {
    width: 400,
    transition: 'width 700ms ease-in-out'
  },
  searchBar: {
    width: 250,
    transitionDelay: '1s',
    transition: 'width 700ms ease-in-out'
  }
})


type Props = {
  search?: Search
  onSearchQueryChange: (query: string) => void
  className?: string
} & WithStyles<typeof styles>

type State = {
  searchBarActive: boolean
}

class SearchBar extends React.Component<Props, State> {

  state: State = { searchBarActive: false }

  render() {
    const { search, classes, onSearchQueryChange, className } = this.props
    const { searchBarActive } = this.state

    return (
      <TextField
        placeholder="Search a file or a directory"
        margin="normal"
        className={ classnames( search || searchBarActive ? classes.searchBarActive : classes.searchBar, className ) }
        onFocus={ () => this.onSearchBarFocus() }
        onBlur={ () => this.onSearchBarBlur() }
        onChange={ (e) => onSearchQueryChange(e.target.value) }
        value={ search ? search.query : '' }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    )
  }

  onSearchBarFocus() {
    this.setState({ searchBarActive: true })
  }

  onSearchBarBlur() {
    this.setState({ searchBarActive: false })
  }

}


export default withStyles(styles)(SearchBar)
