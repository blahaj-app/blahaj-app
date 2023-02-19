import { subDays } from "date-fns";
import moize from "moize";
import { getSearchParams } from "remix-params-helper";
import { $path } from "remix-routes";
import { typedjson } from "remix-typedjson";
import { badRequest } from "remix-utils";
import deserializeLoader from "../../utils/deserialize-loader";
import getDatabase from "../../utils/get-database";
import type { AwaitedReturn, LoaderArgs } from "../../utils/types";
import { InternalStockHistorySearchParamsSchema } from "../../zod/internal-stockhistory-search-params";

export type { InternalStockHistorySearchParams as SearchParams } from "../../zod/internal-stockhistory-search-params";

export const getStockHistoryServer = async (item: string, storeId: string, db: ReturnType<typeof getDatabase>) =>
  db
    .selectFrom("stock")
    .select(["quantity", "reported_at"])
    .where("store_id", "=", storeId)
    .where("type", "=", item)
    .where("created_at", ">", subDays(new Date(), 90))
    .orderBy("created_at", "asc")
    .$assertType<{ quantity: number; reported_at: Date }>()
    .execute();

export const getStockHistoryClient = moize.promise(
  async (item: string, storeId: string) => {
    const res = await fetch($path("/internal/stockhistory", { item, storeId }));
    if (!res.ok) return null;
    const data = await res.json<AwaitedReturn<typeof loader>>();

    return deserializeLoader<typeof loader>(data).history;
  },
  { maxSize: 1000 },
);

export const loader = async ({ context, request }: LoaderArgs) => {
  const db = getDatabase(context.DATABASE_URL);

  const result = getSearchParams(request, InternalStockHistorySearchParamsSchema);

  if (!result.success) {
    throw badRequest("Bad Request");
  }

  const { item, storeId } = result.data;

  const history = await getStockHistoryServer(item, storeId, db);

  return typedjson({ history });
};
