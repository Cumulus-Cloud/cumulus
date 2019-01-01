import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import IconButton from '@material-ui/core/IconButton'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import CloseIcon from '@material-ui/icons/Close'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'

import { Search } from 'store/states/fsState'


const styles = (_: Theme) => createStyles({
  root: {
    flexGrow: 0
  },
  element: {
    margin: '20px',
    marginRight: 0
  },
  content: {
    borderTop: '1px solid rgba(0, 0, 0, 0.12)'
  },
  title: {
    fontSize: '1em',
    display: 'flex',
    height: '14px',
    alignItems: 'center',
    marginTop: '15px'
  },
  titleText: {
    marginBottom: '5px'
  },
  radioButton: {
    height: '30px'
  },
  radioButtonGroup: {
    marginTop: '10px'
  },
  close: {
    float: 'right'
  }
})


type SearchZoneProps = {
  search: Search
  onEndSearch: () => void
} & WithStyles<typeof styles>

function SearchZone(props: SearchZoneProps) {
  const { classes, onEndSearch } = props

  return (
    <div className={ classes.root } >
      <div className={ classes.content } >
        <IconButton className={ classes.close } onClick={ () => onEndSearch() }>
          <CloseIcon/>
        </IconButton>
        <FormGroup row  >
          <FormControl className={ classes.element }>
            <FormLabel>Afficher</FormLabel>

            <RadioGroup
              className={ classes.radioButtonGroup }
              value={'ALL'}
              onChange={(v) => console.log(v/*.target.value*/)}
            >
              <FormControlLabel className={ classes.radioButton } value="ALL" control={ <Radio /> } label="Tous" />
              <FormControlLabel className={ classes.radioButton } value="DIRECTORY" control={ <Radio /> } label="Dossiers" />
              <FormControlLabel className={ classes.radioButton } value="FILE" control={ <Radio /> } label="Fichiers" />
            </RadioGroup>
          </FormControl>

          <FormControl className={ classes.element }>
            <FormLabel>Recherche récursive</FormLabel>
            <FormControlLabel
              control={
                <Switch
                  value="checkedA"
                />
              }
              label="Inclure les dossiers fils"
            />
          </FormControl>

          <FormControl className={ classes.element } >
            <FormLabel>Limiter aux types de fichiers</FormLabel>
              <Select
                value="age-simple"
                inputProps={{
                  name: 'age',
                  id: 'age-simple',
                }}
              />
          </FormControl>

        </FormGroup>
      </div>
    </div>
  )
}

export default withStyles(styles)(SearchZone)
