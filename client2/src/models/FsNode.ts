
export type FsNodeType = 'DIRECTORY' | 'FILE'

export type CompressionType = 'GZIP' | 'DEFLATE'

export type CipherType = 'AES'

export type MetadataType = 'DefaultMetadata' | 'ImageMetadata' | 'PDFDocumentMetadata'

export interface Metadata {
  tags: string[]
  values: Map<string, string>
  metadataType: MetadataType
}

export interface ImageMetadata extends Metadata {
  maker?: string
  model?: string
  datetime?: string
  height?: number
  width?: number
  tags: string[]
  values: Map<string, string>
  metadataType: MetadataType
}

export interface PDFDocumentMetadata extends Metadata {
  pageCount?: number
  title?: string
  author?: string
  creator?: string
  producer?: string
  creationDate?: string
  modificationDate?: string
  tags: string[]
  values: Map<string, string>
  metadataType: MetadataType
}

export interface FsNode {
  id: string
  nodeType: FsNodeType
  path: string
  name: string
  creation: string
  modification: string
  hidden: boolean
  owner: string
}

export interface File extends FsNode {
  id: string,
  nodeType: 'FILE',
  path: string,
  name: string,
  creation: string,
  modification: string,
  hidden: boolean,
  owner: string,
  size: number,
  humanReadableSize: string,
  hash: string,
  mimeType: string,
  cipher?: CipherType,
  compression?: CompressionType,
  hasThumbnail: boolean,
  metadata: Metadata
}

export interface Directory extends FsNode {
  id: string
  nodeType: 'DIRECTORY'
  path: string
  name: string
  creation: string
  modification: string
  hidden: boolean
  owner: string
  content: FsNode[]
}