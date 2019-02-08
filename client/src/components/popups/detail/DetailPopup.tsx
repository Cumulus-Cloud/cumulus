import  React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import { distanceInWords } from 'date-fns'

import { FsPopupType } from 'store/states/popupsState'
import { usePopups } from 'store/store'

import { isFile } from 'models/FsNode'

import Routes from 'services/routes'

import styles from './styles'


const popupType: FsPopupType = 'NODE_DETAIL'


interface Props {
  fullScreen?: boolean
}

type PropsWithStyle = Props & WithStyles<typeof styles>


function DetailsPopup(props: PropsWithStyle) {

  const { isPopupOpen, hidePopup, showPopup, target } = usePopups()

  const { classes, fullScreen } = props
  const node = (target || [])[0]
  const now = new Date()

  if(!node) // If no file is selected, there is nothing to render
    return <span/>

  const onDownload = () => window.open(Routes.api.fs.download(node.id), '_blank')

  const onMove = () => showPopup('NODE_MOVE', [ node ])

  const onDelete = () => showPopup('NODE_DELETION', [ node ])

  const onShare = () => {} // TODO

  const preview =
    isFile(node) && node.hasThumbnail ?
    <div className={ classes.columnImage }>
      <img className={ classes.previewImage } src={ Routes.api.fs.tumbnail(node.id) } />
    </div> :
    <div/>

  const details =
    isFile(node) ?
      [
        <div className={ classes.columnInner } key="file_info_1" >
          <Typography variant="caption">
            <div className={ classes.info }>{ 'Taille du fichier :' }</div>
            <div className={ classes.info }>{ node.humanReadableSize }</div>
          </Typography>
          <br/>
          <Typography variant="caption">
            <div className={ classes.info }>{ 'Création :' }</div>
            <div className={ classes.info }>{ distanceInWords(new Date(node.creation), now) }</div>
          </Typography>
          <br/>
          <Typography variant="caption">
            <div className={ classes.info }>{ 'Modification :' }</div>
            <div className={ classes.info }>{ distanceInWords(new Date(node.creation), now) }</div>
          </Typography>
        </div>,
        <div className={ classes.columnInner } key={ 'file_info_2' }>
          <Typography variant="caption">
            <div className={ classes.info }>{ 'Type de fichier :' }</div>
            <div className={ classes.info }>{ node.mimeType }</div>
          </Typography>
          <br/>
          <Typography variant="caption">
            <div className={ classes.info }>{ 'Compression :' }</div>
            <div className={ classes.info }>{ node.compression ? node.compression : 'aucune' }</div>
          </Typography>
          <br/>
          <Typography variant="caption">
            <div className={ classes.info }>{ 'Chiffrement :' }</div>
            <div className={ classes.info }>{ node.cipher ? node.cipher : 'aucun' }</div>
          </Typography>
        </div>
      ] : [
        <div className={classes.columnInner} key="dir_info_1" >
          <Typography variant="caption">
            {`Création : ${distanceInWords(new Date(node.creation), now)}`}
          </Typography>
          <br/>
          <Typography variant="caption">
            {`Modification : ${distanceInWords(new Date(node.creation), now)}`}
          </Typography>
        </div>,
        <div className={classes.columnInner} key={"dir_info_2"}>

        </div>
      ]

  // TODO Show errors
  return (
    <Dialog
      fullScreen={fullScreen}
      open={isPopupOpen(popupType)}
      onClose={hidePopup}
      PaperProps={{ className: classes.root }}
    >
      <DialogTitle>
        { `Détails de ${node.name}` }
      </DialogTitle>
      <DialogContent>
        <div className={ classes.details }>
          { preview }
          <div className={ classes.column }>
            <div className={ classes.row }>
            { details }
            </div>
            <div className={ classes.columnInner }>
              <div>
                <Chip className={ classes.chip } label={ 'Some tag 1' } key={1} />
                <Chip className={ classes.chip } label={ 'Some tag 2' } key={2} />
                <Chip className={ classes.chip } label={ 'Some tag 3' } key={3} />
                <Chip className={ classes.chip } label={ 'Some tag 4' } key={4} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDelete} >Supprimer</Button>
        <Button onClick={onMove} >Déplacer</Button>
        <Button onClick={onShare} color="primary">Partager</Button>
        { isFile(node) && <Button onClick={onDownload} color="primary" >Télécharger</Button> }
      </DialogActions>
    </Dialog>
  )

}


export default withMobileDialog<Props> ({ breakpoint: 'xs' })(withStyles(styles) (DetailsPopup))
