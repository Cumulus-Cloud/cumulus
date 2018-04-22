import { object, number, array, string } from "validation.ts"
import { FsNodeValidator } from "models/FsNode"

export const SharingSecurityValidator = object({
  encryptedPrivateKey: string,
  privateKeySalt: string,
  salt1: string,
  iv: string,
  secretCodeHash: string,
  salt2: string,
})

export type SharingSecurity = typeof SharingSecurityValidator.T

export const SharingValidator = object({
  id: string,
  reference: string,
  owner: string,
  fsNode: string,
  security: SharingSecurityValidator,
})

export type Sharing = typeof SharingValidator.T

export const SharingItemValidator = object({
  sharing: SharingValidator,
  fsNode: FsNodeValidator,
})

export type SharingItem = typeof SharingItemValidator.T

export const SharingApiResponseValidator = object({
  items: array(SharingItemValidator),
  size: number,
  offset: number,
})

export type SharingApiResponse = typeof SharingApiResponseValidator.T
