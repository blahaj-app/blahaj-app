import type { DataFunctionArgs } from "@remix-run/cloudflare";
import type { Dispatch, SetStateAction } from "react";

export type SetStateType<T> = Dispatch<SetStateAction<T>>;
export type LoaderArgs = DataFunctionArgs & {
  context: { DATABASE_URL: string };
  request: Request & { cf?: IncomingRequestCfProperties };
};
export type AwaitedReturn<T> = T extends (...args: any) => Promise<infer U> ? U : never;
