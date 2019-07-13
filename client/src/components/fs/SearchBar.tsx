import React from 'react'
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

function SearchBar(props: Props) {

  function onSearchBarFocus() {
    props.onSearchBarFocus && props.onSearchBarFocus()
  }

  function onSearchBarBlur() {
    props.onSearchBarBlur && props.onSearchBarBlur()
  }

  const { search, onSearchQueryChange, classes, className } = props

  return (
    <TextField
      placeholder="Rechercher un élément.."
      margin="normal"
      className={ classnames(classes.searchBar, className) }
      onFocus={ () => onSearchBarFocus() }
      onBlur={ () => onSearchBarBlur() }
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


export default withStyles(styles)(SearchBar)
