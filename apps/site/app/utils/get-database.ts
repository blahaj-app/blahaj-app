import type { DB } from "@blahaj-app/database";
import { Pool, neonConfig } from "@neondatabase/serverless";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { Kysely, PostgresDialect } from "kysely";

const getDatabase = (context: AppLoadContext) => {
  neonConfig.wsProxy = context.env.WS_PROXY;

  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: context.env.DATABASE_URL }),
    }),
  });
};

export default getDatabase;
