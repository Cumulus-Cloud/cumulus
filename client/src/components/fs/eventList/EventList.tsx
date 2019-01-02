import React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import InfoIcon from '@material-ui/icons/Info'
import WarningIcon from '@material-ui/icons/Warning'
import CircularProgress from '@material-ui/core/CircularProgress'
import { distanceInWords } from 'date-fns'

import UserBadge from 'components/fs/fileList/UserBadge'
import Table from 'components/utils/Table/InfiniteScrollTable'
import Content, { ContentError } from 'components/utils/layout/Content'

import { ApiError } from 'models/ApiError'
import { User } from 'models/User'
import { Event, EventType } from 'models/Event'

import { connect, withStore } from 'store/store'
import { getEvents } from 'store/actions/event'

import styles from './styles'

const EventTitle: Record<EventType, string> = {
  'NODE_CREATE': 'Création',
  'NODE_DELETE': 'Suppression',
  'NODE_MOVE': 'Déplacement',
  'NODE_SHARE': 'Partage',
  'USER_LOGIN': 'Connexion',
  'USER_LOGOUT': 'Déconnexion'
}

function eventToText(e: Event) {
  switch(e.eventType) {
    case 'USER_LOGIN':
      return `Connexion depuis ${e.from}` + (e.infinite ? ' avec une session infinie' : '')
    case 'USER_LOGOUT':
      return '-'
    case 'NODE_CREATE':
      if(e.nodeType === 'DIRECTORY')
        return `Création du dossier '${e.to}'`
      else
        return `Upload du fichier '${e.to}'`
    case 'NODE_MOVE':
      if(e.nodeType === 'DIRECTORY')
        return `Déplacement du dossier '${e.from}' vers '${e.to}'`
      else
        return `Déplacement du fichier '${e.from}' vers '${e.to}'`
    case 'NODE_DELETE':
      if(e.nodeType === 'DIRECTORY')
        return `Suppression du dossier '${e.from}'`
      else
        return `Suppression du fichier '${e.from}'`
    case 'NODE_SHARE':
      if(e.nodeType === 'DIRECTORY')
        return `Partage du dossier '${e.from}'`
      else
        return `Partage du fichier '${e.from}'`
  }
}


interface Props {
  /** Current user */
  user: User,
  /** Loaded events, from the store. */
  content: Event[]
  /** Maximum number of contained node. */
  hasMore: boolean
  /** If the store is loading the data. */
  loading: boolean
  /** Loading error */
  error?: ApiError

  onLoadMoreContent: (offset: number) => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

class EventList extends React.Component<PropsWithStyle, {}> {

  constructor(props: PropsWithStyle) {
    super(props)
    props.onLoadMoreContent(0)
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

  renderElementRow = (event: Event, style: React.CSSProperties, _: boolean): JSX.Element => {
    const { classes } = this.props

    const now = new Date()

    /*
    const menu =
      <div>
        <IconButton onClick={ (e) => this.onToggleMenu(node, e) } >
          <MoreVertIcon />
        </IconButton>
        {
          !isScrolling &&
          <Menu
            id="simple-menu"
            anchorEl={ selectedMenu ? selectedMenu.anchor : undefined }
            open={ !!selectedMenu && (selectedMenu.nodeId === node.id) }
            onClose={ (e) => this.onToggleMenu(node, e) }
          >
            <MenuItem onClick={ (e) => { this.onToggleMenu(node, e); this.onShowNodeDetail(node)} } >Détails</MenuItem>
            <MenuItem>Télécharger</MenuItem>
            <MenuItem onClick={ (e) => { this.onToggleMenu(node, e); this.onDeleteNode(node) }} >Supprimer</MenuItem>
            <MenuItem>Partager</MenuItem>
          </Menu>
        }
      </div>
    */

    return (
      <div
        className={ classes.contentRow }
        style={ style }
      >
        <Typography variant="body1" noWrap className={ classes.contentType }>
          <span className={ classes.contentDescriptionValue }>{ EventTitle[event.eventType] }</span>
        </Typography>
        <Typography variant="body1" noWrap className={ classes.contentDescription }>
          <span className={ classes.contentDescriptionValue }>{ eventToText(event) }</span>
        </Typography>
        <Typography variant="body1" className={ classes.contentCreation } >
          { distanceInWords(new Date(event.creation), now) }
        </Typography>
      </div>
    )
  }

  render() {
    const { user, content, hasMore, loading, error, classes } = this.props

    const events = content ? content : []
    const showLoading = loading && events.length === 0

    const errorContent = (
      !showLoading && error &&
      <ContentError
        icon={ <WarningIcon /> }
        text={ `Une erreur est survenue au chargement des évènements : ${error.message}` }
      />
    )

    const tableHeader = (
      <>
        <Typography variant="caption" noWrap className={classes.contentType} >Type</Typography>
        <Typography variant="caption" noWrap className={classes.contentDescription} >Description</Typography>
        <Typography variant="caption" className={classes.contentCreation} >Date</Typography>
      </>
    )

    const table = (
      !showLoading && !error &&
      <>
        {
          events.length == 0 ? (
            <ContentError
              icon={ <InfoIcon /> }
              text={ 'Aucune action n\'a été effectuée' }
            />
          ) : (
            <Table<Event>
              elements={ events }
              elementsSize={ events.length + (hasMore ? 1 : 0) }
              rowHeight={ 45 }
              header={ tableHeader }
              renderRow={ this.renderElementRow }
              renderLoadingRow={ this.renderLoadingRow }
              elementKey={ (node) => node.id }
              onLoadMoreElements={ (offset) => this.props.onLoadMoreContent(offset) }
              loading={ loading }
            />
          )
        }
      </>
    )

    const header = (
      <>
        <div>TODO go back to files</div>
        <UserBadge user={ user } />
      </>
    )

    return (
      <Content
        header={ header }
        error={ errorContent }
        content={ table }
        loading={ showLoading }
      />
    )

  }

}

const mappedProps =
  connect(({ events, auth }, dispatch) => {
    const { user } = auth

    if(!user) // Should not happen
      throw new Error('Event list accessed without authentication')

    return {
      user: auth.user,
      loading: events.loading,
      content: events.events || [],
      hasMore: events.hasMore,
      error: events.error,
      onLoadMoreContent: () => {
        dispatch(getEvents())
      }
    }
  })

export default withStore(withStyles(styles)(EventList), mappedProps)
