import { $path } from "remix-routes";
import type { EmbedOembedSearchParams } from "../zod/embed-oembed-search-params";

interface GenerateLinksParams {
  oembed?: EmbedOembedSearchParams;
}

export const generateLinks = ({ oembed }: GenerateLinksParams) => [
  {
    type: "application/json+oembed",
    href: new URL($path("/embed/oembed.json", oembed ?? {}), __baseUrl__).href,
  } as any,
];
