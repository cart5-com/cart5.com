import type { InferRequestType, InferResponseType } from 'hono/client'
export type ReqType<T> = InferRequestType<T>;
export type ResType<T> = InferResponseType<T>;