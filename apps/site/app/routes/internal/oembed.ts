import type { LoaderArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getSearchParams } from "remix-params-helper";
import { badRequest, notFound } from "remix-utils";
import { BASE_URL } from "../../utils/constants";
import findStore from "../../utils/find-store";
import getOrCache from "../../utils/get-or-cache";
import { ITEM_NAME } from "../../utils/item-names";
import { mapGlobalMetaTitle, mapStoreMetaTitle } from "../../utils/templates";
import type { InternalOembedSearchParams } from "../../zod/internal-oembed-search-params";
import { InternalOembedSearchParamsSchema } from "../../zod/internal-oembed-search-params";

export type { InternalOembedSearchParams as SearchParams } from "../../zod/internal-oembed-search-params";

const getOembed = (params: InternalOembedSearchParams) =>
  getOrCache(
    "oembed-" + JSON.stringify(params),
    () => {
      let oembed: Record<string, string> = {
        version: "1.0",
        type: "rich",
        title: "Blåhaj Invetory Tracker",
        provider_name: "blahaj.app",
        provider_url: BASE_URL,
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

export const loader = async ({ context, request }: LoaderArgs) => {
  const result = getSearchParams(request, InternalOembedSearchParamsSchema);

  if (!result.success) {
    throw badRequest("Bad Request");
  }

  const { data } = result;

  const [oembed, promise] = await getOembed(data);

  context.waitUntil(promise);

  return json(oembed);
};
