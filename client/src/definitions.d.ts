
declare module '*.css' {
  interface ClassNames {
    [className: string]: string
  }
  const classNames: ClassNames
  export = classNames
}

declare function Messages(key: string, ...args: string[]): string
