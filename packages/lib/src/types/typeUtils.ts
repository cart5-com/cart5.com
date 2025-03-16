// this typing is to make sure typing work with hono rpc.
// https://hono.dev/docs/guides/rpc
// api never returns {} but drizzle adds a {} when there is no "with" query ...

export type NonEmpty<T> = T extends {} ? (T[keyof T] extends never ? never : T) : T;

export type NonEmptyArray<T> = T extends (infer U)[] ? NonEmpty<U>[] : T;