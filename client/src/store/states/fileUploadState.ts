import difference_in_milliseconds = require('date-fns/difference_in_milliseconds')

import { AppError } from 'models/ApiError'
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
  error?: AppError
}

export default interface FileUploadState {
  files: EnrichedFile[],
  uploading: FileUploadingState[],
  showUploadInProgress: boolean
}

export const initialState: () => FileUploadState =
  () => ({
    files: [],
    uploading: [],
    showUploadInProgress: false
  })

export function computeUploadingSpeed(uploadingState: FileUploadingState): number {

  const progress = uploadingState.progressOverTime.slice().reverse()
  const fileSize = uploadingState.file.file.size

  // Scan over the last minutes

  const lastMinute = new Date(new Date().getTime() - 1000 * 60)
  const progressLastMinutes = progress.filter(value => value.date.getTime() > lastMinute.getTime())
  const recentProgress = progressLastMinutes[0]
  const oldProgress = progressLastMinutes[progressLastMinutes.length - 1]

  const percentageOfUpload = recentProgress.progress - oldProgress.progress
  const realDuration = difference_in_milliseconds(recentProgress.date, oldProgress.date)

  const bytes = (percentageOfUpload / 100) * fileSize
  const bytesPerSecons = bytes/(realDuration / 1000)

  return bytesPerSecons
}