import * as React from 'react'
import { debounce } from 'throttle-debounce'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import InfoIcon from '@material-ui/icons/Info'
import WarningIcon from '@material-ui/icons/Warning'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import CloudIcon from '@material-ui/icons/CloudUpload'
import Slide from '@material-ui/core/Slide'
import Fade from '@material-ui/core/Fade'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dropzone from 'react-dropzone'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Switch from '@material-ui/core/Switch'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Select from '@material-ui/core/Select'
import Grow from '@material-ui/core/Grow'
import Zoom from '@material-ui/core/Zoom'
import SearchIcon from '@material-ui/icons/Search'
import CloseIcon from '@material-ui/icons/Close'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import uuid = require('uuid/v4')

import { Directory, FsNode } from 'models/FsNode'
import { ApiError } from 'models/ApiError'
import { EnrichedFile } from 'models/EnrichedFile'

import FileListTable from 'components/fs/FileListTable'
import BreadCrumb from 'components/fs/BreadCrumb'

import { connect, withStore } from 'store/store'
import { Search, SearchDefault } from 'store/states/fsState'
import { getDirectory, search } from 'store/actions/directory'
import { selectUploadFile } from 'store/actions/fileUpload'

import { togglePopup } from 'utils/popup'

import Routes from 'services/routes'


const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    backgroundColor: 'white',
    minWidth: 0,
    display: 'flex'
  },
  dropzone: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
    color: '#fff',
    zIndex: 9999,
    display: 'flex'
  },
  dropzoneWrapper: {
    position: 'relative',
    display: 'flex', 
    flex: 1,
    flexDirection: 'column'
  },
  dropzoneInner: {
    border: '5px lightgray dotted',
    margin: 11,
    borderRadius: 33,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropzoneIcon: {
    width: 200,
    height: 200
  },
  dropzoneText: {
    color: 'white'
  },
  loaderContent: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit
  },
  header: {
    display: 'flex'
  },
  breadCrumb: {
    flex: 1,
    width: 100,
    overflow: 'auto'
  },
  contentWrapper: {
    width: '100%',
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'flex',
    flex: 1
  },
  searchZoneElement: {
    margin: '20px',
    marginRight: 0
  },

  searchBarActive: {
    width: 400,
    transition: 'width 700ms ease-in-out'
  },
  searchBar: {
    width: 250,
    transition: 'width 700ms ease-in-out'
  },
  searchZone: {
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
  },
  searchZoneContent: {
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    paddingLeft: '15px',
    //display: 'flex',
  },
  searchZoneTitle: {
    fontSize: '1em',
    display: 'flex',
    height: '14px',
    alignItems: 'center',
    marginTop: '15px'
  },
  searchZoneTitleText: {
    marginBottom: '5px'
  },
  searchZoneRadioButton: {
    height: '30px'
  },
  searchZoneRadioButtonGroup: {
    marginTop: '10px'
  },
  searchZoneClose: {
    float: 'right'
  },

  errorContent: {
    flex: 1,
    alignContent: 'center'
  },
  errorButton: {
    display: 'flex',
    margin: 'auto',
    textDecoration: 'none'
  },
  content: {
    display: 'flex',
    flex: 1
  },
  loader: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 5
  },
  emptyDirectory: {
    display: 'flex',
    flex: 1,
    height: '50px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyDirectoryIcon: {
    marginRight: theme.spacing.unit
  }
})

interface Props {
  /** Called when the path should be updated, meaning when the path was changed within the app. */
  onChangePath: (path: string) => void
  /** Called when the search is updated */
  onChangeSearch: (searchParams: Search | undefined) => void
  /** Called when the current directory should be loaded from the api. */
  onLoadDirectory: (path: string) => void
  /** List of files selected for the upload */
  onFileUpload: (files: EnrichedFile[]) => void
  /** Initial real path, comming from the browser path */
  initialPath: string
  /** Loaded current directory, from the store. */
  currentDirectory?: Directory
  /** Content of the loaded current directory, from the store. */
  currentDirectoryContent?: FsNode[]
  /** If the store is loading the data */
  loading: boolean
  /** If the store is loading more content */
  contentLoading: boolean
  /** Loading error */
  error?: ApiError
  /** Search */
  search?: Search
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  /** If the user is hovering the dropzone */
  dropzoneActive: boolean
  searchBarActive: boolean
  search?: Search
}

class FilesList extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { dropzoneActive: false, searchBarActive: false, search: props.search }
    this.checkIfPathNeedsRefresh()
  }
  
  debuncedSearchChange = debounce(400, false, (updatedSearch: Search | undefined) => {
    this.props.onChangeSearch(updatedSearch)
  })

  onSearchChange(updatedSearch: Search | undefined) {
    this.setState({ search: updatedSearch })
    this.debuncedSearchChange(updatedSearch)
  }

  onSearchQueryChange(value: string) {
    const search = this.state.search || SearchDefault
    this.onSearchChange({ ...search, query: value })
  }

  /*
  onSearchElementTypeChange = debounce(300, false, (value: string) => {
    const search: Search = this.props.search || SearchDefault
    this.onSearchChange({ ...search, query: value })
  })*/

  private onEndSearch() {
    this.onSearchChange(undefined)
  }

  private onSearchBarFocus() {
    this.setState({ searchBarActive: true })
  }

  private onSearchBarBlur() {
    this.setState({ searchBarActive: false })
  }

  componentDidUpdate() {
    this.checkIfPathNeedsRefresh()
  }

  private checkIfPathNeedsRefresh() {
    const { loading, currentDirectory, initialPath, error } = this.props

    // Needs to update if not during a loading, and if the two path have changed (in that case the 'real' path wins)
    // This will likely occure during the first loading, or if the user use the browser history to navigate
    const needToUpdatePath =
      !error && !loading && (currentDirectory ? initialPath !== currentDirectory.path : true)

    if(needToUpdatePath)
      this.props.onLoadDirectory(initialPath)
  }

  private onChangePath(path: string) {
    this.props.onChangePath(path)
  }
  
  private droppedFiles(files: File[]) {
    const { currentDirectory } = this.props 
    const enrichedFiles = files.map((file) => {
      return {
        id: uuid(),
        filename: file.name,
        location: currentDirectory ? currentDirectory.path : '/',
        compressed: false,
        crypted: true,
        file
      }
    }) 

    this.props.onFileUpload(enrichedFiles)
    this.setState({ dropzoneActive: false })
  }

  private onDragEnter() {
    this.setState({ dropzoneActive: true })
  }

  private onDragLeave() {
    this.setState({ dropzoneActive: false })
  }

  render() {
    const { initialPath, currentDirectory, currentDirectoryContent, search, loading, contentLoading, classes, error } = this.props
    const { dropzoneActive, searchBarActive } = this.state
    const localSearch = this.state.search

    const files = currentDirectoryContent ? currentDirectoryContent : []
    const showLoading = loading || (contentLoading && files.length === 0)

    const dropZone = dropzoneActive &&
      <Fade in={true} >
        <div className={classes.dropzone} >
          <div className={classes.dropzoneInner} >
            <CloudIcon className={classes.dropzoneIcon} />
            <Typography variant="display1" className={classes.dropzoneText} >
              Lâcher pour ajouter au dossier courant
            </Typography>
          </div>
        </div>
      </Fade>

    const loader = showLoading &&
      <div className={classes.content} >
        <CircularProgress className={classes.loader} size={100} color="primary"/>
      </div> 

    const breadCrumb = currentDirectory ?
      <BreadCrumb className={classes.breadCrumb} path={currentDirectory.path} onPathSelected={(path) => this.onChangePath(path)} /> :
      <div style={{ flex: 1 }} />

    const searchBar = currentDirectory &&
      <TextField
        placeholder="Search a file or a directory"
        margin="normal"
        className={localSearch || searchBarActive ? classes.searchBarActive : classes.searchBar}
        onFocus={() => this.onSearchBarFocus()}
        onBlur={() => this.onSearchBarBlur()}
        onChange={e => this.onSearchQueryChange(e.target.value)}
        value={localSearch ? localSearch.query : ''}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      /*
          <Typography className={classes.searchZoneTitle} variant="display1" gutterBottom>
            <SearchIcon />
            <span className={classes.searchZoneTitleText} >Options de recherche</span>
          </Typography>
      */

    const searchZone = search && (
      <Slide direction="up" in>
        <div className={classes.searchZone} >
          <div className={classes.searchZoneContent} >
            <IconButton className={classes.searchZoneClose} onClick={() => this.onEndSearch()}>
              <CloseIcon/>
            </IconButton>
            <FormGroup row  >
              <FormControl className={classes.searchZoneElement} component="fieldset">
                <FormLabel component="legend">Afficher</FormLabel>
                
                <RadioGroup
                  className={classes.searchZoneRadioButtonGroup} 
                  value={'ALL'}
                  onChange={(v) => console.log(v.target.value)}
                >
                  <FormControlLabel className={classes.searchZoneRadioButton} value="ALL" control={<Radio />} label="Tous" />
                  <FormControlLabel className={classes.searchZoneRadioButton} value="DIRECTORY" control={<Radio />} label="Dossiers" />
                  <FormControlLabel className={classes.searchZoneRadioButton} value="FILE" control={<Radio />} label="Fichiers" />
                </RadioGroup>

              </FormControl>

              <FormControl className={classes.searchZoneElement} component="fieldset">
                <FormLabel component="legend">Recherche récursive</FormLabel>
                <FormControlLabel
                  control={
                    <Switch
                      value="checkedA"
                    />
                  }
                  label="Inclure les dossiers fils"
                />
              </FormControl>

              <FormControl className={classes.searchZoneElement} component="fieldset">
                <FormLabel component="legend">Limiter aux types de fichiers</FormLabel>
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
      </Slide>
    )

    const displayedError = !showLoading && error &&
      <Slide direction="up" in={true}>
        <div className={classes.errorContent} >
          <Typography variant="caption" className={classes.emptyDirectory}> 
            <WarningIcon className={classes.emptyDirectoryIcon}/>
            {`Une erreur est survenue au chargement de ${initialPath} : ${error.message}`}
          </Typography>
          {
            error.key === 'api-error.not-found' && 
            <Button variant="outlined" color="primary" className={classes.errorButton} onClick={() => this.onChangePath('/')} >Go back to the root directory</Button>
          }
        </div>
      </Slide>

    const content = !showLoading && !error &&
      <Slide direction="up" in={true}>
        <div className={classes.content} >
          {
            files.length == 0 ?
            <Typography variant="caption" className={classes.emptyDirectory} >
              <InfoIcon className={classes.emptyDirectoryIcon}/>
              {'Ce dossier est vide'} 
            </Typography> :
            <FileListTable />
          }
        </div>
      </Slide>

    return (
      <main className={classes.root} >
        <Dropzone
          disableClick  
          className={classes.dropzoneWrapper}
          onDrop={(files) => this.droppedFiles(files)}
          onDragEnter={() => this.onDragEnter()}
          onDragLeave={() => this.onDragLeave()}
        >
          {dropZone}
          <div className={classes.header} >
            {breadCrumb}
            {searchBar}
          </div>
          {searchZone}
          <div className={classes.contentWrapper} >
            {loader}
            {displayedError}
            {content}
          </div>
        </Dropzone>
      </main>
    )

  }

}
 

const mappedProps =
  connect(({ fs, router }, dispatch) => ({
    initialPath: router.location.pathname.substring(7),
    currentDirectory: fs.current,
    currentDirectoryContent: fs.content,
    loading: fs.loadingCurrent,
    contentLoading: fs.loadingContent,
    error: fs.error,
    search: fs.search,
    onChangePath: (path: string) => {
      router.push(`${Routes.app.fs}${path}${router.location.search}`)
      dispatch(getDirectory(path))
    },
    onChangeSearch: (searchParams: Search | undefined) => {
      // TODO router.push
      dispatch(search(searchParams))
    },
    onLoadDirectory: (path: string) => {
      dispatch(getDirectory(path))
    },
    onFileUpload: (files: EnrichedFile[]) => {
      dispatch(selectUploadFile(files))
      togglePopup('FILE_UPLOAD', true)(router)
    }
  }))

export default withStore(withStyles(styles) <PropsWithStyle> (FilesList), mappedProps)
