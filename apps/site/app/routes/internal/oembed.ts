import { json } from "@remix-run/cloudflare";
import { getSearchParams } from "remix-params-helper";
import { badRequest, notFound } from "remix-utils";
import { BASE_URL } from "../../utils/constants";
import findStore from "../../utils/find-store";
import getStoreCountryDatum from "../../utils/get-store-country-datum";
import { ITEM_NAME } from "../../utils/item-names";
import { mapGlobalMetaTitle, mapStoreMetaTitle } from "../../utils/templates";
import toRegionalIndicators from "../../utils/to-regional-indicators";
import type { LoaderArgs } from "../../utils/types";
import { InternalOembedSearchParamsSchema } from "../../zod/internal-oembed-search-params";

export type { InternalOembedSearchParams as SearchParams } from "../../zod/internal-oembed-search-params";

export const loader = async ({ context, request }: LoaderArgs) => {
  const result = getSearchParams(request, InternalOembedSearchParamsSchema);

  if (!result.success) {
    throw badRequest("Bad Request");
  }

  const { data } = result;

  let oembed: Record<string, string> = {
    version: "1.0",
    type: "rich",
    title: "Blåhaj Invetory Tracker",
    provider_name: "blahaj.app",
    provider_url: BASE_URL,
  };

  if (data?.type === "map_global") {
    oembed = {
      ...oembed,
      title: mapGlobalMetaTitle(ITEM_NAME[data.item]),
    };
  } else if (data?.type === "map_store") {
    const store = findStore(data.storeId);

    if (!store) {
      throw notFound("Not Found");
    }

    const country = getStoreCountryDatum(store);
    const flag = toRegionalIndicators(country.code);

    oembed = {
      ...oembed,
      title: mapStoreMetaTitle(ITEM_NAME[data.item], store.name, flag),
    };
  }

  return json(oembed);
};
