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
import Content, { ContentError } from 'components/utils/layout/Content'

import { FsNode } from 'models/FsNode'

import { Search, SearchDefault } from 'store/states/fsState'
import { useFilesystem, useAuthentication, useFileUpload, usePopups, useRouting, useNodeDisplacement } from 'store/store'

import styles from './styles'


type PropsWithStyle = WithStyles<typeof styles> & WithDragAndDrop<FsNode[]>


function FilesList(props: PropsWithStyle) {

  const [dropzoneActive, setDropzoneActive] = React.useState(false)
  const [localSearch, setLocalSearch] = React.useState<Search | undefined>(undefined)
  //const [initialized, setInitialized] = React.useState(false)

  // TODO test
  React.useEffect(() => {
    checkIfPathNeedsRefresh()
  })

  const { current, loadingCurrent, content, loadingContent, error, search, initialPath, getDirectory } = useFilesystem()
  const { moveNodes } = useNodeDisplacement()
  const { selectUploadFile } = useFileUpload()
  const { showPopup, hidePopup } = usePopups()
  const { showFs } = useRouting()
  const { user } = useAuthentication()

  const { classes } = props

  if(!user) // Should not happen
    throw new Error('File list accessed without authentication')

  // TODO move in hooks
  const checkIfPathNeedsRefresh = () => {
    // Needs to update if not during a loading, and if the two path have changed (in that case the 'real' path wins)
    // This will likely occur during the first loading, or if the user use the browser history to navigate
    const needToUpdatePath =
      !error && !loadingCurrent && (current ? initialPath !== current.path : true)

    if(needToUpdatePath)
      onLoadDirectory(initialPath)
  }

  const onLoadDirectory = (path: string) => {
    hidePopup() // Security, close popup when changing directory
    getDirectory(path)
  }

  const onChangePath = (path: string) => {
    showFs(path)
    getDirectory(path)
  }

  const onDroppedFiles = (files: File[]) => {
    const enrichedFiles = files.map((file) => {
      return {
        id: uuid(),
        filename: file.name,
        location: current ? current.path : '/',
        compressed: false,
        crypted: true,
        file
      }
    })

    selectUploadFile(enrichedFiles)
    showPopup('FILE_UPLOAD')
    setDropzoneActive(false)
  }

  const onSearchChange = (updatedSearch: Search | undefined) => {
    setLocalSearch(updatedSearch)
    debuncedSearchChange(updatedSearch)
  }

  const onSearchQueryChange = (value: string) => {
    const search = localSearch || SearchDefault
    onSearchChange({ ...search, query: value })
  }

  const onEndSearch = () => {
    search(undefined)
    setLocalSearch(undefined)
  }

  const debuncedSearchChange = debounce(400, false, (updatedSearch: Search | undefined) => {
    if(!updatedSearch || updatedSearch.query !== '')
      onSearchChange(updatedSearch)
  })


  const files = content ? content : []
  const showLoading = loadingCurrent || (loadingContent && files.length === 0)

  const header = (
    current ?
    (
      <>
        <BreadCrumb path={current.path} onChangePath={onChangePath} onMoveNodes={moveNodes} {...dragAndDropProps(props)} />
        <SearchBar search={ localSearch } onSearchQueryChange={onSearchQueryChange} />
        <UserBadge />
      </>
    ) : (
      <div style={ { flex: 1 } } /> // Placeholder during loading
    )
  )

  const errorContent = (
    !showLoading && error &&
    <ContentError
      icon={ <WarningIcon /> }
      text={ `Une erreur est survenue au chargement de ${initialPath} : ${error.message}` }
      actions={
        error.key === 'api-error.not-found' ?
        <Button variant="outlined" color="primary" className={classes.errorButton} onClick={() =>  onChangePath('/')} >Go back to the root directory</Button> :
        undefined
      }
    />
  )

  const fileList = (
    !showLoading && !error &&
    <>
      {
        files.length == 0 ? (
          <ContentError
            icon={ <InfoIcon /> }
            text={ 'Ce dossier est vide' }
          />
        ) : (
          <FileListTable onPathChanged={() => setLocalSearch(undefined)} { ...dragAndDropProps(props) } />
        )
      }
    </>
  )

  return (
    <FileDropzone
      className={classes.dropzoneWrapper}
      onDrop={onDroppedFiles}
      onDragEnter={() => setDropzoneActive(true)}
      onDragLeave={() => setDropzoneActive(false)}
    >
      { dropzoneActive && <DropzonePlaceholder /> }
      <Content
        header={header}
        error={errorContent}
        content={
          <>
            { localSearch && <SearchZone search={localSearch} onEndSearch={onEndSearch} /> }
            { fileList }
          </>
        }
        loading={showLoading}
      />
    </FileDropzone>
  )

}


export default withDragAndDrop(
  withStyles(styles)(FilesList),
  DraggedElement
)
