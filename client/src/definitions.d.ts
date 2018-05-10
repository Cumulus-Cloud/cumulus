declare module "ts-debounce" {
  export type Procedure = (...args: any[]) => void;
  export type Options = {
    isImmediate: boolean,
  }

  export function debounce<F extends Procedure>(
    func: F,
    waitMilliseconds = 50,
    options: Options = {
      isImmediate: false
    },
  ): F
}

declare module "*.css" {
  interface ClassNames {
    [className: string]: string
  }
  const classNames: ClassNames
  export = classNames
}

declare function Messages(key: string, ...args: string[]): string
