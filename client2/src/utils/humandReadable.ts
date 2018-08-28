
export function humanFileSize(size: number) {
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`
}

export function humanSpeed(speed: number, timeUnit: string) {
  return `${humanFileSize(speed)}/${timeUnit}`
}
