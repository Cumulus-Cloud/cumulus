import  React from 'react'
import { debounce } from 'throttle-debounce'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import InfoIcon from '@material-ui/icons/Info'
import WarningIcon from '@material-ui/icons/Warning'
import Button from '@material-ui/core/Button'
import Slide from '@material-ui/core/Slide'
import CircularProgress from '@material-ui/core/CircularProgress'
import uuid = require('uuid/v4')

import { Directory, FsNode } from 'models/FsNode'
import { ApiError } from 'models/ApiError'
import { EnrichedFile } from 'models/EnrichedFile'

import FileDropzone from 'components/utils/FileDropzone'
import FileListTable from 'components/fs/list/FileListTable'
import BreadCrumb from 'components/fs/list/BreadCrumb'
import DropzonePlaceholder from 'components/fs/list/Dropzone'
import SearchBar from 'components/fs/list/SearchBar'
import SearchZone from 'components/fs/list/SearchZone'

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
  dropzoneWrapper: {
    position: 'relative',
    display: 'flex', 
    flex: 1,
    flexDirection: 'column'
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
  searchBar: {
    // TODO
    marginRight: 24
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
  })
  */

  onEndSearch() {
    this.props.onChangeSearch(undefined)
    this.setState({ search: undefined })
  }


  componentDidUpdate() {
    this.checkIfPathNeedsRefresh()
  }

  checkIfPathNeedsRefresh() {
    const { loading, currentDirectory, initialPath, error } = this.props

    // Needs to update if not during a loading, and if the two path have changed (in that case the 'real' path wins)
    // This will likely occur during the first loading, or if the user use the browser history to navigate
    const needToUpdatePath =
      !error && !loading && (currentDirectory ? initialPath !== currentDirectory.path : true)

    if(needToUpdatePath)
      this.props.onLoadDirectory(initialPath)
  }

  onChangePath(path: string) {
    this.props.onChangePath(path)
  }
  
  droppedFiles(files: File[]) {
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

  onDragEnter() {
    this.setState({ dropzoneActive: true })
  }

  onDragLeave() {
    this.setState({ dropzoneActive: false })
  }

  render() {
    const { initialPath, currentDirectory, currentDirectoryContent, loading, contentLoading, search, error, classes } = this.props
    const { dropzoneActive, search: localSearch } = this.state
    
    const files = currentDirectoryContent ? currentDirectoryContent : []
    const showLoading = loading || (contentLoading && files.length === 0)

    const loader = (
      showLoading && (
        <div className={ classes.content } >
          <CircularProgress className={ classes.loader } size={ 100 } color="primary"/>
        </div>
      )
    )

    const errorContent = (
      !showLoading && error &&
      <Slide direction="up" in >
        <div className={ classes.errorContent } >
          <Typography variant="caption" className={ classes.emptyDirectory }> 
            <WarningIcon className={ classes.emptyDirectoryIcon }/>
            { `Une erreur est survenue au chargement de ${initialPath} : ${error.message}` }
          </Typography>
          {
            error.key === 'api-error.not-found' && 
            <Button variant="outlined" color="primary" className={ classes.errorButton } onClick={ () =>  this.onChangePath('/') } >Go back to the root directory</Button>
          }
        </div>
      </Slide>
    )

    const content = (
      !showLoading && !error &&
      <Slide direction="up" in >
        <div className={ classes.content } >
          {
            files.length == 0 ? (
              <Typography variant="caption" className={classes.emptyDirectory} >
                <InfoIcon className={classes.emptyDirectoryIcon}/>
                {'Ce dossier est vide'} 
              </Typography>
            ) : (
              <FileListTable onPathChanged={() => this.setState({ search: undefined })} />
            )
          }
        </div>
      </Slide>
    )

    return (
      <main className={ classes.root }>
        <FileDropzone
          className={ classes.dropzoneWrapper }
          onDrop={ (files) => this.droppedFiles(files) }
          onDragEnter={ () => this.onDragEnter() }
          onDragLeave={ () => this.onDragLeave() }
        >
          { dropzoneActive && <DropzonePlaceholder classes={ classes } /> }
          <div className={ classes.header } >
            { 
              currentDirectory ?
              (
                <>
                  <BreadCrumb className={ classes.breadCrumb } path={ currentDirectory.path } onPathSelected={ (path) => this.onChangePath(path) } /> 
                  <SearchBar search={ localSearch } onSearchQueryChange={ (query) => this.onSearchQueryChange(query) } />
                </>
              ) : (
                <div style={ { flex: 1 } } /> // Placeholder during loading
              )
            }
          </div>
          { search && <SearchZone search={ search } onEndSearch={ () => this.onEndSearch() } /> }
          <div className={ classes.contentWrapper } >
            { loader || errorContent || content }
          </div>
        </FileDropzone>
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

export default withStore(withStyles(styles)(FilesList), mappedProps)
