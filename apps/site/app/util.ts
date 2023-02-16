import type { DB } from "@blahaj-app/database";
import { Pool } from "@neondatabase/serverless";
import type { DataFunctionArgs } from "@remix-run/cloudflare";
import { Kysely, PostgresDialect } from "kysely";
import type { Dispatch, SetStateAction } from "react";
import type { RemixSerializedType, UseDataFunctionReturn } from "remix-typedjson";
import { deserializeRemix } from "remix-typedjson";

export type SetStateType<T> = Dispatch<SetStateAction<T>>;
export type LoaderArgs = DataFunctionArgs & {
  context: {
    DATABASE_URL: string;
  };
  request: Request & {
    cf?: IncomingRequestCfProperties;
  };
};
export type AwaitedReturn<T> = T extends (...args: any) => Promise<infer U> ? U : never;
export const getDatabase = (connectionString: string) =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });
export const definedOrEmptyArray = <T>(value: T): T[] => (value ? [value] : []);
export const deserializeLoader = <T extends (...args: any) => any>(data: AwaitedReturn<T>) => {
  return deserializeRemix(data as RemixSerializedType<T>) as UseDataFunctionReturn<T>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};
