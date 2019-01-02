import  React from 'react'
import CloudUpload from '@material-ui/icons/CloudUpload'
import ShareIcon from '@material-ui/icons/Share'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'
import withMobileDialog from '@material-ui/core/withMobileDialog'

import Layout from 'components/utils/layout/Layout'
import { ActionGroup } from 'components/utils/layout/Menu'
import EventList from 'components/fs/eventList/EventList'


interface Props {}


class EventViewer extends React.Component<Props> {

  render() {
    const actions: ActionGroup = {
      actions: [
        {
          icon: <CreateNewFolderIcon />,
          label: 'Créer un dossier'
        },
        {
          icon: <CloudUpload />,
          label: 'Uploader un fichier'
        },
        {
          icon: <ShareIcon />,
          label: 'Partager un dossier'
        }
      ]
    }

    return (
      <Layout actions={ [ actions ] } >
        <EventList />
      </Layout>
    )
  }
}

export default withMobileDialog<Props> ({ breakpoint: 'xs' })(EventViewer)
