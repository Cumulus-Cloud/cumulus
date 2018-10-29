
export type InCommon<T, U> = T extends U ? T : never
export type NotInCommon<T, U> = T extends U ? never : T

export type Intersect<A, B> = Pick<A, InCommon<keyof A, keyof B>>
export type Difference<A, B> = Pick<A, NotInCommon<keyof A, keyof B>>
