import { ApiList } from 'models/utils'
import { Metadata, PDFDocumentMetadata } from 'models/FsNode'

export type FsNodeType = 'DIRECTORY' | 'FILE'

export type CompressionType = 'GZIP' | 'DEFLATE'

export type CipherType = 'AES'

export type MetadataType = 'DefaultMetadata' | 'ImageMetadata' | 'PDFDocumentMetadata'


export interface DefaultMetadata {
  tags: string[]
  values: Map<string, string>
  metadataType: 'DefaultMetadata'
}

export interface ImageMetadata {
  maker?: string
  model?: string
  datetime?: string
  height?: number
  width?: number
  tags: string[]
  values: Map<string, string>
  metadataType: 'ImageMetadata'
}

export interface PDFDocumentMetadata {
  pageCount?: number
  title?: string
  author?: string
  creator?: string
  producer?: string
  creationDate?: string
  modificationDate?: string
  tags: string[]
  values: Map<string, string>
  metadataType: 'PDFDocumentMetadata'
}

export type Metadata = DefaultMetadata | ImageMetadata | PDFDocumentMetadata


export interface File {
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

export interface Directory {
  id: string
  nodeType: 'DIRECTORY'
  path: string
  name: string
  creation: string
  modification: string
  hidden: boolean
  owner: string
}

export type FsNode =  File | Directory

export interface DirectoryWithContent {
  directory: Directory,
  content: ApiList<FsNode>,
  totalContentLength: number
}

export interface FsOperationCreate {
  operationType: 'CREATE'
}

export interface FsOperationMove {
  to: string,
  operationType: 'MOVE'
}

export interface FsOperationShareLink {
  passwordProtection?: string
  duration?: number
  needAuthentication?: boolean
  operationType: 'SHARE_LINK'
}

export interface FsOperationShareDelete {
  reference: string
  operationType: 'SHARE_DELETE'
}

export interface FsOperationDelete {
  reference: string
  operationType: 'DELETE'
}

export type FsOperation = 
  FsOperationCreate |
  FsOperationMove |
  FsOperationShareLink |
  FsOperationShareDelete | 
  FsOperationDelete
