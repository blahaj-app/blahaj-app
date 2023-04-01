import type { AppLoadContext, LoaderArgs } from "@remix-run/cloudflare";
import { subDays } from "date-fns";
import moize from "moize";
import { $path } from "remix-routes";
import { typedjson } from "remix-typedjson";
import { badRequest, promiseHash } from "remix-utils";
import deserializeLoader from "../../utils/deserialize-loader";
import getDatabase from "../../utils/get-database";
import getOrCache from "../../utils/get-or-cache";
import parseSearchParams from "../../utils/parse-search-params";
import type { AwaitedReturn } from "../../utils/types";
import { InternalGlobalDataSearchParamsSchema } from "../../zod/internal-globaldata-search-params";

export type { InternalGlobalDataSearchParams } from "../../zod/internal-globaldata-search-params";

export const getGlobalDataServer = async (context: AppLoadContext, item: string) =>
  getOrCache(
    "globaldata-" + item,
    context.waitUntil,
    () => {
      const db = getDatabase(context.env.DATABASE_URL);

      return promiseHash({
        stocks: db
          .selectFrom("stock")
          .select(["store_id", "quantity", "reported_at"])
          .distinctOn(["store_id", "type"])
          .where("type", "=", item)
          .where("created_at", ">", subDays(new Date(), 2))
          .orderBy("store_id")
          .orderBy("type")
          .orderBy("created_at", "desc")
          .execute(),
        allRestocks: db
          .selectFrom("restock")
          .select(["store_id", "quantity", "reported_at", "earliest", "latest"])
          .where("type", "=", item)
          .orderBy("earliest", "desc")
          .execute(),
      });
    },
    5 * 60,
  );

export const getGlobalDataClient = moize.promise(
  async (item: string) => {
    const res = await fetch($path("/internal/globaldata", { item }));
    if (!res.ok) return null;
    const data = await res.json<AwaitedReturn<typeof loader>>();

    return deserializeLoader<typeof loader>(data).globalData;
  },
  { maxSize: 5, maxAge: 5 * 60 * 1000 },
);

export const loader = async ({ context, request }: LoaderArgs) => {
  const result = parseSearchParams(request, InternalGlobalDataSearchParamsSchema);

  if (!result.success) {
    throw badRequest("Bad Request");
  }

  const { item } = result.data;

  const globalData = await getGlobalDataServer(context, item);

  return typedjson({ globalData });
};
