import  React from 'react'
import TextField from '@material-ui/core/TextField'
import withMobileDialog from '@material-ui/core/withMobileDialog'

import { connect, withStore } from 'store/store'
import { createDirectory } from 'store/actions/directoryCreation'
import { hidePopup } from 'store/actions/popups'
import { FsPopupType } from 'store/states/popupsState'
import Table from 'components/utils/Table/InfiniteScrollTable'
import Content, { ContentError } from 'components/utils/layout/Content'

import { ApiError } from 'models/ApiError'
import { Directory, FsNode } from 'models/FsNode'

import Popup from 'components/utils/Popup'
import { BreadCrumb2 } from 'components/fs/breadCrumb/BreadCrumb';
import { Typography, CircularProgress, WithStyles, createStyles, Theme, withStyles } from '@material-ui/core';
import Api from 'services/api';



const styles = (theme: Theme) => createStyles({
  button: {
    textTransform: 'none',
    fontWeight: 'normal'
  },
  icon: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginRight: theme.spacing.unit
  },
  header: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center'
  },
  contentIcon: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit * 2
  },
  contentDescription: {
    margin: 0,
    flex: 4,
    padding: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center'
  },
  contentDescriptionValue: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer'
  },
  contentCreation: {
    flex: 2,
    padding: theme.spacing.unit * 2
  },
  contentType: {
    flex: 2,
    padding: theme.spacing.unit * 2,
    display: 'flex'
  },
  contentRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    userSelect: 'none',
    height: '45px',
    alignItems: 'center',
    ['&:hover'] : {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  },
  loader: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 5
  },
  loaderSpinner: {
    display: 'block',
    marginRight: theme.spacing.unit,
    marginBottom: 0
  },
  loaderText: {
    display: 'flex',
    height: '50px',
    alignItems: 'center',
    justifyContent: 'center'
  }
})


type Props2 = {
  currentNode: Directory
  nodes: FsNode[]
  contentSize: number
}

type State2 = {
  currentNode: Directory
  nodes: FsNode[]
  contentSize: number
  loading: boolean
}

type Props2WithStyle = Props2 & WithStyles<typeof styles>


// NEXT TODO
// - retirer la dépendance au contexte de BreadCrumb
// - update de l'API pour ne pas retourner un or mais avoir les erreurs dans le catch (plus simple à gérer)
// - faire marcher le breadcrumb
// - faire en sorte de pouvoir selectionner un seul element, et dégriser le bouton quand il est selectionné
// - comment selectionner le dossier root ?
// - :rocket:


class Test extends React.Component<Props2WithStyle, State2> {

  constructor(props: Props2WithStyle) {
    super(props)
    this.state = {
      currentNode: props.currentNode,
      nodes: props.nodes,
      contentSize: props.contentSize,
      loading: false
    }
  }

  loadContent = (node: FsNode) => {
    this.setState({ loading: true })

    Api.fs.getContent(node.id).then((result) => {
      if ('errors' in result) {
        // TODO
      } else {
        this.setState({
          loading: false,
          currentNode: result.directory,
          nodes: result.content.items,
          contentSize: result.totalContentLength
        })
      }
    })
  }

  renderElementRow = (node: FsNode, style: React.CSSProperties, _: boolean): JSX.Element => {
    return (
      <Typography variant="body1" noWrap style={ style } onClick={ () => this.loadContent(node) } >{ node.name }</Typography>
    )
  }

  renderLoadingRow = (style: React.CSSProperties): React.ReactElement<{}> => {
    const { classes } = this.props

    return (
      <div
        style={style}
        className={classes.loader}
      >
        <div className={classes.loaderSpinner} >
          <CircularProgress size={20} color="primary"/>
        </div>
        <Typography variant="caption" className={classes.loaderText} >
          {'Chargement de plus de contenu..'}
        </Typography>
      </div>
    )
  }

  onLoadMoreContent = (offset: number) => {
    console.log(offset)
  }

  render() {
    const { currentNode, nodes, contentSize, loading } = this.state


    const tableHeader = (
      <>
        <BreadCrumb2 path={currentNode.path} onChangePath={() => {}} onMoveNodes={() => {}} />
      </>
    )

    return (
      <div style={{ height: 300, display: 'flex' }} >

      <Content
        header={
          <>
            <Typography variant="caption">Séléctionner le dossier où déplacer</Typography>
          </>
        }
        content={
          <Table<FsNode>
            elements={ nodes }
            elementsSize={ contentSize }
            rowHeight={ 45 }
            header={ tableHeader }
            renderRow={ this.renderElementRow }
            renderLoadingRow={ this.renderLoadingRow }
            elementKey={ (node) => node.id }
            onLoadMoreElements={ this.onLoadMoreContent }
            loading={ false }
          />
        }
        loading={ loading }
      />
      </div>
    )
  }

}

const Test2 = withStyles(styles)(Test)


const popupType: FsPopupType = 'NODE_MOVE'

interface Props {
  onClose: () => void
  //onCreateDirectory: (name: string) => void
  open: boolean
  fullScreen?: boolean
  loading: boolean
  current?: Directory
  nodes: FsNode[]
  contentSize: number
  error?: ApiError
}

interface State {
  directoryName: string
}


class CreationPopup extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = { directoryName: '' }
  }

  onClose() {
    this.props.onClose()
  }

  onCreateDirectory() {
    const basePath = this.props.current ? this.props.current.path : '/'
    //this.props.onCreateDirectory(`${basePath}/${this.state.directoryName}`)
  }

  onDirectoryNameChange(directoryName: string) {
    this.setState({ directoryName })
  }

  render() {
    const { open, error, loading, nodes, current, contentSize } = this.props

    return (
      <Popup
        title="Créer un nouveau dossier"
        action="Créer le dossier"
        cancel="Annuler"
        error={ error && error.errors['path'] && error.errors['path'][0] }
        loading={ loading }
        open={ open }
        onClose={ () => this.onClose() }
        onValidate={ () => this.onCreateDirectory() }
      >
        { current && <Test2 nodes={nodes} currentNode={current} contentSize={contentSize} /> }
      </Popup>
    )
  }

}


const mappedProps =
  connect((state, dispatch) => {

    return {
      open: state.popups.open === popupType,
      current: state.fs.current,
      nodes: state.fs.content || [],
      contentSize: state.fs.contentSize || 0,
      loading: state.directoryCreation.loading,
      error: state.directoryCreation.error,
      onClose: () => {
        dispatch(hidePopup())
      },
      onCreateDirectory: (path: string) => {
        dispatch(createDirectory(path)).then((state) => {
          if(!state.directoryCreation.error)
            dispatch(hidePopup())
        })
      }
    }
  })

export default withStore(withMobileDialog<Props> ({ breakpoint: 'xs' })(CreationPopup), mappedProps)
