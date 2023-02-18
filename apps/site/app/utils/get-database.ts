import type { DB } from "@blahaj-app/database";
import { Pool } from "@neondatabase/serverless";
import { Kysely, PostgresDialect } from "kysely";

const getDatabase = (connectionString: string) =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });

export default getDatabase;
