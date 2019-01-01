import React from 'react'
import { debounce } from 'throttle-debounce'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import InfoIcon from '@material-ui/icons/Info'
import WarningIcon from '@material-ui/icons/Warning'
import Button from '@material-ui/core/Button'
import { withDragAndDrop, WithDragAndDrop, dragAndDropProps } from 'components/utils/DragAndDrop'
import uuid = require('uuid/v4')

import FileDropzone from 'components/utils/FileDropzone'
import FileListTable from 'components/fs/fileListTable/FileListTable'
import BreadCrumb from 'components/fs/breadCrumb/BreadCrumb'
import DropzonePlaceholder from 'components/fs/dropzone/Dropzone'
import SearchBar from 'components/fs/SearchBar'
import SearchZone from 'components/fs/SearchZone'
import UserBadge from 'components/fs/fileList/UserBadge'
import DraggedElement from 'components/fs/fileList/DraggedElement'
import CumulusContent, { CumulusContentError } from 'components/CumulusContent'

import { Directory, FsNode } from 'models/FsNode'
import { ApiError } from 'models/ApiError'
import { EnrichedFile } from 'models/EnrichedFile'
import { User } from 'models/User'

import { connect, withStore } from 'store/store'
import { Search, SearchDefault } from 'store/states/fsState'
import { getDirectory, search } from 'store/actions/directory'
import { showPopup, hidePopup } from 'store/actions/popups'
import { selectUploadFile } from 'store/actions/fileUpload'

import Routes from 'services/routes'

import styles from './styles'


interface Props {
  /** Called when the path should be updated, meaning when the path was changed within the app. */
  onChangePath: (path: string) => void
  /** Called when the search is updated */
  onChangeSearch: (searchParams: Search | undefined) => void
  /** Called when the current directory should be loaded from the api. */
  onLoadDirectory: (path: string) => void
  /** List of files selected for the upload */
  onFileUpload: (files: EnrichedFile[]) => void
  /** Current user */
  user: User,
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

type PropsWithStyle = Props & WithStyles<typeof styles> & WithDragAndDrop<FsNode[]>

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
    if(!updatedSearch || updatedSearch.query !== '')
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
    const { user, initialPath, currentDirectory, currentDirectoryContent, loading, contentLoading, search, error, classes } = this.props
    const { dropzoneActive, search: localSearch } = this.state

    const files = currentDirectoryContent ? currentDirectoryContent : []
    const showLoading = loading || (contentLoading && files.length === 0)

    const header = (
      currentDirectory ?
      (
        <>
          <BreadCrumb className={ classes.breadCrumb } {...dragAndDropProps(this.props)} />
          <SearchBar search={ localSearch } onSearchQueryChange={ (query) => this.onSearchQueryChange(query) } />
          <UserBadge user={ user } />
        </>
      ) : (
        <div style={ { flex: 1 } } /> // Placeholder during loading
      )
    )

    const errorContent = (
      !showLoading && error &&
      <CumulusContentError
        icon={ <WarningIcon /> }
        text={ `Une erreur est survenue au chargement de ${initialPath} : ${error.message}` }
        actions={
          error.key === 'api-error.not-found' ?
          <Button variant="outlined" color="primary" className={ classes.errorButton } onClick={ () =>  this.onChangePath('/') } >Go back to the root directory</Button> :
          undefined
        }
      />
    )

    const content = (
      !showLoading && !error &&
      <>
        {
          files.length == 0 ? (
            <CumulusContentError
              icon={ <InfoIcon /> }
              text={ 'Ce dossier est vide' }
            />
          ) : (
            <FileListTable onPathChanged={() => this.setState({ search: undefined })} { ...dragAndDropProps(this.props) } />
          )
        }
      </>
    )

    return (
      <FileDropzone
        className={ classes.dropzoneWrapper }
        onDrop={ (files) => this.droppedFiles(files) }
        onDragEnter={ () => this.onDragEnter() }
        onDragLeave={ () => this.onDragLeave() }
      >
        { dropzoneActive && <DropzonePlaceholder /> }
        <CumulusContent
          header={ header }
          error={ errorContent }
          content={
            <>
              { search && <SearchZone search={ search } onEndSearch={ () => this.onEndSearch() } /> }
              { content }
            </>
          }
          loading={ showLoading }
        />
      </FileDropzone>
    )
  }

}


const mappedProps =
  connect(({ fs, router, auth }, dispatch) => {
    const { user } = auth

    if(!user) // Should not happen
      throw new Error('File list accessed without authentication')

    return {
      user: auth.user,
      initialPath: router.location.pathname.substring(7),
      currentDirectory: fs.current,
      currentDirectoryContent: fs.content,
      loading: fs.loadingCurrent,
      contentLoading: fs.loadingContent,
      error: fs.error,
      search: fs.search,
      onChangePath: (path: string) => {
        router.push(`${Routes.app.fs}${path}${router.location.search}`) // TODO in an action
        dispatch(getDirectory(path))
      },
      onChangeSearch: (searchParams: Search | undefined) => {
        // TODO router.push ?
        dispatch(search(searchParams))
      },
      onLoadDirectory: (path: string) => {
        dispatch(hidePopup()) // Security, close popup when changing directory
        dispatch(getDirectory(path))
      },
      onFileUpload: (files: EnrichedFile[]) => {
        dispatch(selectUploadFile(files)) // TODO maybe change
          .then(() => dispatch(showPopup({ type: 'FILE_UPLOAD' })))
      }
    }
  })

export default withDragAndDrop(
  withStore(withStyles(styles)(FilesList), mappedProps),
  DraggedElement
)
