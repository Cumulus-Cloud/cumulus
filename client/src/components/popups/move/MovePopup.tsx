import  React from 'react'
import withMobileDialog from '@material-ui/core/withMobileDialog'

import { connect, withStore } from 'store/store'
import { createDirectory } from 'store/actions/directoryCreation'
import { hidePopup } from 'store/actions/popups'
import { FsPopupType } from 'store/states/popupsState'
import Table from 'components/utils/Table/InfiniteScrollTable'

import { ApiError } from 'models/ApiError'
import { Directory, FsNode } from 'models/FsNode'

import Popup from 'components/utils/Popup'
import { BreadCrumb2 } from 'components/fs/breadCrumb/BreadCrumb';
import { Typography, CircularProgress, WithStyles, createStyles, Theme, withStyles } from '@material-ui/core';
import Api from 'services/api'
import NodeIcon from 'components/fs/NodeIcon'
import classnames = require('classnames');


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
  contentName: {
    flex: 2,
    padding: theme.spacing.unit * 2,
    display: 'flex'
  },
  contentSelected: {
    color: theme.palette.primary.light
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
  contentRowSelected: {
    backgroundColor: 'rgba(41, 167, 160, 0.08)',
    color: theme.palette.primary.light,
    ['&:hover'] : {
      backgroundColor: 'rgba(41, 167, 160, 0.18)'
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
  current: Directory
  onChange: (directory: Directory) => void
}

type State2 = {
  current: Directory
  nodes: Directory[]
  selected: FsNode
  contentSize: number
  loading: boolean
  loadingContent: boolean
  error?: ApiError
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
      current: props.current,
      selected: props.current,
      nodes: [],
      contentSize: 0,
      loading: false,
      loadingContent: false
    }
  }

  componentDidMount() {
    this.loadDirectory(this.state.current.path)
  }

  loadDirectory = (path: string) => {
    this.setState({ loading: true })

    Api.fs.getDirectory(path)
      .then((directory) => Api.fs.getContent(directory.id))
      .then((directoryWithContent) => {
        this.setState({
          loading: false,
          current: directoryWithContent.directory,
          selected: directoryWithContent.directory,
          nodes: directoryWithContent.content.items as Directory[],
          contentSize: directoryWithContent.totalContentLength,
          error: undefined
        })
        this.props.onChange(directoryWithContent.directory)
      })
      .catch((e: ApiError) => {
        this.setState({ loading: false, error: e })
      })
  }

  loadMoreContent = (offset: number) => {
    const { current, nodes } = this.state

    this.setState({ loadingContent: true })

    Api.fs.getContent(current.id, 'DIRECTORY', offset)
      .then((directoryWithContent) => {
        this.setState({
          nodes: nodes.concat(directoryWithContent.content.items as Directory[]),
          loadingContent: false,
          error: undefined
        })
      })
      .catch((e: ApiError) => {
        this.setState({ loadingContent: false, error: e })
      })
  }

  selectNode = (node: Directory) => {
    const { selected, current } = this.state

    if (selected === node) {
      this.setState({ selected: current })
      this.props.onChange(current)
    } else {
      this.setState({ selected: node })
      this.props.onChange(node)
    }
  }

  renderElementRow = (node: Directory, style: React.CSSProperties, _: boolean): JSX.Element => {
    const { classes } = this.props
    const { selected } = this.state

    const isSelected = selected === node

    return (
      <div
        className={ classnames(classes.contentRow, { [classes.contentRowSelected]: isSelected }) }
        style={ style }
        onClick={() => this.selectNode(node)}
      >
        <Typography variant="body1" noWrap className={ classnames(classes.contentName, { [classes.contentSelected]: isSelected }) }>
          <NodeIcon node={ node } selected={ isSelected } />
          <span className={ classes.contentDescriptionValue } onClick={() => this.loadDirectory(node.path)} >{ node.name }</span>
        </Typography>
      </div>
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

  render() {
    const { current, selected, nodes, contentSize, loadingContent } = this.state

    const tableHeader = (
      <span style={{ paddingLeft: '7px', display: 'flex', flex: 1 }} >
        <BreadCrumb2 path={ current.path } selected={ selected.path } onChangePath={ this.loadDirectory } />
      </span>
    )

    return (
      <div style={{ height: 300, display: 'flex' }} >
        <Table<Directory>
          elements={ nodes }
          elementsSize={ contentSize }
          rowHeight={ 45 }
          header={ tableHeader }
          renderRow={ this.renderElementRow }
          renderLoadingRow={ this.renderLoadingRow }
          elementKey={ (node) => node.id }
          onLoadMoreElements={ this.loadMoreContent }
          loading={ loadingContent }
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
  current: Directory
  nodes: FsNode[]
  contentSize: number
  error?: ApiError
}

interface State {
  selected: Directory
}


class CreationPopup extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = { selected: props.current }
  }

  selectDirectory = (directory: Directory) => {
    this.setState({ selected: directory })
  }

  onClose = () => {
    this.props.onClose()
  }

  render() {
    const { open, error, loading, current } = this.props
    const { selected } = this.state

    return (
      <Popup
        title="Déplacer la sélection"
        action={`Déplacer vers ${selected.name ? selected.name : 'dossier racine'}`}
        cancel="Annuler"
        error={ error && error.errors['path'] && error.errors['path'][0] }
        loading={ loading }
        open={ open }
        onClose={ this.onClose }
        onValidate={ () => {}}
      >
        { current && <Test2 current={current} onChange={ this.selectDirectory } /> }
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
