import type { Request } from "@cloudflare/workers-types";
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context: Context) => ({
    env: context.env,
    waitUntil: context.waitUntil,
    cf: (context.request as unknown as Request).cf,
  }),
});

interface Env {
  WS_PROXY: string;
  DATABASE_URL: string;
  RESVG: Fetcher;
}

type Context = EventContext<Env, any, unknown>;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    env: Context["env"];
    waitUntil: Context["waitUntil"];
    cf?: Request["cf"];
  }
}

export const onRequest = (context: Context) => handleRequest(context);
