import { FsNode } from "models/FsNode"

export type PreviewAction =
  ShowPreview

export type ShowPreview = { type: "ShowPreview", fsNode?: FsNode }
export const onShowPreview = (fsNode?: FsNode): ShowPreview => ({
  type: "ShowPreview",
  fsNode
})
