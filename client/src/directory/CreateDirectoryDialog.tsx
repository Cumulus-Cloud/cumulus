/*
import * as React from "react"

import { Errors } from "../services/Api"
import FlatButton from "material-ui/FlatButton"
import Dialog from "material-ui/Dialog"
import TextField from "material-ui/TextField"

interface Props {
  newDirectoryName: string
  open: boolean
  onNewDirectoryNameChange: (event: React.FormEvent<HTMLInputElement>) => void
  onCancel: () => void
  onSubmit: () => void
  errors?: Errors
}

export default function CreateDirectoryDialog(props: Props) {
  const { newDirectoryName, open, errors, onNewDirectoryNameChange, onSubmit, onCancel } = props
  const actions = [
    <FlatButton
      label="Cancel"
      primary={true}
      onTouchTap={onCancel}
    />,
    <FlatButton
      label="Submit"
      primary={true}
      disabled={newDirectoryName === ""}
      onTouchTap={onSubmit}
    />,
  ]
  return (
    <Dialog
        title="Create New Directory"
        modal={false}
        open={open}
        actions={actions}
        onRequestClose={onCancel}
      >
        <TextField
          floatingLabelText="Name"
          errorText={errors && errors["location"].join(" ")}
          value={newDirectoryName}
          onChange={onNewDirectoryNameChange}
        />
      </Dialog>
  )
}
*/