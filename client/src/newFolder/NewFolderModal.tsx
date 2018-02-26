import * as React from "react"
import Modal from "components/modals/Modal"
import ModalActions from "components/modals/ModalActions"
import ModalHeader from "components/modals/ModalHeader"
import ModalContent from "components/modals/ModalContent"
import FlatButton from "components/buttons/FlatButton"
import NewFolderFrom from "newFolder/NewFolderFrom"
import { ApiError } from "services/Api"

interface Props {
  error?: ApiError
  newFolderName: string
  onWantCreateNewFolder(): void
  onNewFolderNameChange(newFolderName: string): void
  onNewFolderSubmit(): void
}

export default function NewFolderModal({ error, newFolderName, onWantCreateNewFolder, onNewFolderNameChange, onNewFolderSubmit }: Props) {
  return (
    <Modal onClose={onWantCreateNewFolder}>
      <ModalHeader title={Messages("ui.createNewFolder")} />
      <ModalContent>
        <NewFolderFrom
          name={newFolderName}
          error={error}
          onChange={onNewFolderNameChange}
          onSubmit={onNewFolderSubmit}
        />
      </ModalContent>
      <ModalActions>
        <FlatButton label={Messages("ui.cancel")} onClick={onWantCreateNewFolder} />
        <FlatButton label={Messages("ui.create")} onClick={onNewFolderSubmit} />
      </ModalActions>
    </Modal>
  )
}
