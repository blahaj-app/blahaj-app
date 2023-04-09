import type { Dispatch, SetStateAction } from "react";

export type UseStateType<S> = [S, Dispatch<SetStateAction<S>>];
export type SetStateType<T> = Dispatch<SetStateAction<T>>;
export type AwaitedReturn<T> = T extends (...args: any) => Promise<infer U> ? U : never;
export type RemoveQuestionMarks<S extends string> = S extends `${infer Prefix}?${infer Suffix}`
  ? `${Prefix}${Suffix}`
  : S;
export type PathUnion<S extends string> = S extends `${infer Prefix}/${infer Suffix}`
  ? `${Prefix}/${PathUnion<Suffix>}` | `${Prefix}`
  : S extends ""
  ? never
  : `${S}`;
