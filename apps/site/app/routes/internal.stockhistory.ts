import type { AppLoadContext, LoaderArgs } from "@remix-run/cloudflare";
import { subDays } from "date-fns";
import { typedjson } from "remix-typedjson";
import { badRequest } from "remix-utils";
import { route } from "routes-gen";
import deserializeLoader from "../utils/deserialize-loader";
import getDatabase from "../utils/get-database";
import getOrCache from "../utils/get-or-cache";
import parseSearchParams from "../utils/parse-search-params";
import type { AwaitedReturn } from "../utils/types";
import withQuery from "../utils/with-query";
import type { InternalStockHistorySearchParams } from "../zod/internal-stockhistory-search-params";
import { InternalStockHistorySearchParamsSchema } from "../zod/internal-stockhistory-search-params";

export type SearchParams = InternalStockHistorySearchParams;

export const getStockHistoryServer = async (context: AppLoadContext, item: string, storeId: string) =>
  getOrCache(
    "stockhistory-" + item + "-" + storeId,
    context.waitUntil,
    () => {
      const db = getDatabase(context);

      return db
        .selectFrom("stock")
        .select(["quantity", "reported_at"])
        .where("store_id", "=", storeId)
        .where("type", "=", item)
        .where("created_at", ">", subDays(new Date(), 90))
        .orderBy("created_at", "asc")
        .execute();
    },
    32.5 * 60,
  );

export const getStockHistoryClient = async (item: string, storeId: string) => {
  const res = await fetch(withQuery<SearchParams>(route("/internal/stockhistory"), { item, storeId }));
  if (!res.ok) return null;
  const data = await res.json<AwaitedReturn<typeof loader>>();

  return deserializeLoader<typeof loader>(data).history;
};

export const loader = async ({ context, request }: LoaderArgs) => {
  const result = parseSearchParams(request, InternalStockHistorySearchParamsSchema);

  if (!result.success) {
    throw badRequest("Bad Request");
  }

  const { item, storeId } = result.data;

  const history = await getStockHistoryServer(context, item, storeId);

  return typedjson({ history });
};
