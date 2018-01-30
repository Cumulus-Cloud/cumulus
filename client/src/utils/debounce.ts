// TODO remove any
export default function debounce(func: any, wait: number, immediate?: boolean) {
  let timeout: any
  return function(this: any) {
    // tslint:disable-next-line:no-this-assignment
    const context = this
    const args = arguments
    const later = function() {
      timeout = null
      if (!immediate) { func.apply(context, args) }
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) { func.apply(context, args) }
  }
}
