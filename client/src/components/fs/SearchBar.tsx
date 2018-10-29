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
  searchBar: {
    width: 250,
    transitionDelay: '1s',
    transition: 'width 700ms ease-in-out'
  }
})


type Props = {
  search?: Search
  onSearchQueryChange: (query: string) => void
  onSearchBarFocus?: () => void
  onSearchBarBlur?: () => void
  className?: string
} & WithStyles<typeof styles>

type State = {}

class SearchBar extends React.Component<Props, State> {

  state: State = {}

  onSearchBarFocus() {
    this.props.onSearchBarFocus && this.props.onSearchBarFocus()
  }

  onSearchBarBlur() {
    this.props.onSearchBarBlur && this.props.onSearchBarBlur()
  }

  render() {
    const { search, classes, onSearchQueryChange, className } = this.props

    return (
      <TextField
        placeholder="Rechercher un élément.."
        margin="normal"
        className={ classnames(classes.searchBar, className) }
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

}


export default withStyles(styles)(SearchBar)
