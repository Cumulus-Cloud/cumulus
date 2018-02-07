import * as React from "react"
import { FsNode } from "models/FsNode"
import { Share } from "models/Share"
import Modal from "components/modals/Modal"
import ModalActions from "components/modals/ModalActions"
import ModalHeader from "components/modals/ModalHeader"
import ModalContent from "components/modals/ModalContent"
import FlatButton from "components/buttons/FlatButton"

interface Props {
  share: Share,
  sharedFsNode: FsNode
  onClose: () => void
}

export default function ShareModal({ share, sharedFsNode, onClose }: Props) {
  return (
    <Modal onClose={onClose}>
      <ModalHeader title={Messages("ui.share")} />
      <ModalContent>
        {encodeURI(`${document.location.origin}${share.download}`)}
      </ModalContent>
      <ModalActions>
        <FlatButton label={Messages("ui.cancel")} onClick={onClose} />
      </ModalActions>
    </Modal>
  )
}
