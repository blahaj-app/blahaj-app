import type { AppLoadContext, LoaderArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { badRequest, notFound } from "remix-utils";
import findStore from "../../utils/find-store";
import getOrCache from "../../utils/get-or-cache";
import { ITEM_NAME } from "../../utils/item-names";
import parseSearchParams from "../../utils/parse-search-params";
import { mapGlobalMetaTitle, mapStoreMetaTitle } from "../../utils/templates";
import type { EmbedOembedSearchParams } from "../../zod/embed-oembed-search-params";
import { EmbedOembedSearchParamsSchema } from "../../zod/embed-oembed-search-params";

export type { EmbedOembedSearchParams as SearchParams } from "../../zod/embed-oembed-search-params";

const getOembed = (context: AppLoadContext, params: EmbedOembedSearchParams) =>
  getOrCache(
    "oembed-" + JSON.stringify(params),
    context.waitUntil,
    () => {
      let oembed: Record<string, string> = {
        version: "1.0",
        type: "rich",
        title: "Blåhaj Invetory Tracker",
        provider_name: "blahaj.app",
        provider_url: __baseUrl__,
      };

      if (params?.type === "map_global") {
        oembed = {
          ...oembed,
          title: mapGlobalMetaTitle(ITEM_NAME[params.item]),
        };
      } else if (params?.type === "map_store") {
        const store = findStore(params.storeId);

        if (!store) {
          throw notFound("Not Found");
        }

        // const country = getStoreCountryDatum(store);
        // const flag = toRegionalIndicators(country.code);

        oembed = {
          ...oembed,
          title: mapStoreMetaTitle(ITEM_NAME[params.item], store.name),
        };
      }

      return oembed;
    },
    6 * 60 * 12,
  );

export const loader = async ({ context, request, params }: LoaderArgs) => {
  const result = parseSearchParams(request, EmbedOembedSearchParamsSchema);

  if (!result.success) {
    throw badRequest("Bad Request");
  }

  const { data } = result;

  return json(getOembed(context, data));
};
