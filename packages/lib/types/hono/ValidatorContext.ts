import { type Context } from 'hono';

export type ValidatorContext<
    T extends (...args: any) => any
> = Parameters<T>[0] extends Context<
    any, any, infer U
> ? U : never;
