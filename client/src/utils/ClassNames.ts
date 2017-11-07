
export default function classNames(classes: Record<string, boolean>): string {
  return Object.keys(classes).filter(key => classes[key]).join(" ")
}
