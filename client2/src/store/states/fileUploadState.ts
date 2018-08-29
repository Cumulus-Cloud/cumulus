import difference_in_milliseconds = require('date-fns/difference_in_milliseconds')

import { ApiError } from 'models/ApiError'
import { EnrichedFile } from 'models/EnrichedFile'

interface FileUploadingStateTimeProgess {
  date: Date
  progress: number
}

export interface FileUploadingState {
  file: EnrichedFile
  progressOverTime: FileUploadingStateTimeProgess[]
  progress: number
  loading: boolean
  start: Date
  error?: ApiError
}

export default interface FileUploadState {
  files: EnrichedFile[],
  uploading: FileUploadingState[],
  showUploadInProgress: boolean
}

export function computeUploadingSpeed(uploadingState: FileUploadingState): number {

  const progress = uploadingState.progressOverTime.slice().reverse()
  const size = progress.length > 10 ? 10 : progress.length - (progress.length % 2)
  let couples = []

  for(let i = 0; i < size; i++) {
    const i2 = Math.floor(i/2)
    couples[i2] ? couples[i2].push(progress[i]) : couples[i2] = [progress[i]]
  }

  const speeds = couples.map((couple) => {
    const progress = couple[0].progress - couple[1].progress
    const duration = difference_in_milliseconds(couple[0].date, couple[1].date)

    const bytes = (progress / 100) * uploadingState.file.file.size
    const bytesPerSecons = bytes/(duration / 1000)

    return bytesPerSecons
  })

  return Math.round(speeds.reduce((p, c) => p + c, 0) / speeds.length)
}
