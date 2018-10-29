import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import TextField from '@material-ui/core/TextField'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import LockIcon from '@material-ui/icons/Lock'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import CompressionIcon from '@material-ui/icons/UnfoldLess'
import NoCompressionIcon from '@material-ui/icons/MoreHoriz'
import RemoveIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import FormGroup from '@material-ui/core/FormGroup'
import Divider from '@material-ui/core/Divider'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import { EnrichedFile } from 'models/EnrichedFile'


const styles = (_: Theme) => createStyles({
  fileHeader: {
    display: 'flex'
  },
  input: {
    display: 'none'
  },
  fileName: {
    flex: 1
  },
  fileIcons: {
    paddingTop: 5,
    marginLeft: -6,
    display: 'flex'
  },
  fileIcon : {
    height: 15
  },
  fileDeleteIcon: {
    marginRight:  '32px !important',
    paddingRight: '12px !important' // Block default padding
  },
  fileButton: {
    width: '90%',
    margin: 'auto',
    display: 'block',
    textAlign: 'center'
  }
})

interface Props {
  onDelete: () => void
  onUpdate: (updatedFile: EnrichedFile) => void
  file: EnrichedFile
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {}

class UploadFile extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = {}
  }

  onDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    this.props.onDelete()
  }

  onFilenameChange(filename: string) {
    if(this.props.file.filename !== filename)
      this.props.onUpdate({ ...this.props.file, filename })
  }

  onCipherChange(crypted: boolean) {
    this.props.onUpdate({ ...this.props.file, crypted })
  }

  onCompressionChange(compressed: boolean) {
    this.props.onUpdate({ ...this.props.file, compressed })
  }

  render() {
    const { classes, file } = this.props

    const iconCompression =
      file.compressed ?
        [
          <CompressionIcon key="compression-icon" className={classes.fileIcon} />,
          <span key="compression-text">Compressé</span>
        ] :
        [
          <NoCompressionIcon key="compression-icon" className={classes.fileIcon} />,
          <span key="compression-text">Non compressé</span>
        ] 
      
      const iconCypher =
        file.crypted ?
          [
            <LockIcon key="cipher-icon" className={classes.fileIcon} />,
            <span key="cipher-text">Chiffré</span>
          ] :
          [
            <LockOpenIcon key="cipher-icon" className={classes.fileIcon} />,
            <span key="cipher-text">Non chiffré</span>
          ] 

    return (
      <div>
        <ExpansionPanel elevation={0} >
          <ExpansionPanelSummary className={classes.fileHeader} expandIcon={<ExpandMoreIcon />}>
            <div className={classes.fileName}>
              <Typography  >{file.filename}</Typography>
              <Typography className={classes.fileIcons} variant="caption" >
                {iconCypher}
                {iconCompression}
              </Typography>
            </div>
      
            <IconButton className={classes.fileDeleteIcon}  onClick={(e) => this.onDelete(e)} >
              <RemoveIcon/>
            </IconButton>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>

            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={file.crypted}
                    color="primary"
                    onChange={(e) => this.onCipherChange(e.target.checked)}
                  />
                }
                label="Chiffrer"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={file.compressed}
                    color="primary"
                    onChange={(e) => this.onCompressionChange(e.target.checked)}
                  />
                }
                label="Compresser"
              />
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Nom du fichier"
                type="text"
                value={file.filename}
                fullWidth
                onChange={(e) => this.onFilenameChange(e.target.value)}
              />
            </FormGroup>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <Divider />
      </div>
    )
     
  }

}

export default withStyles(styles)(UploadFile)
