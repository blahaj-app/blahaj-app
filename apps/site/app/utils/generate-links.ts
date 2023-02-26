import { $path } from "remix-routes";
import type { EmbedOembedSearchParams } from "../zod/embed-oembed-search-params";
import { BASE_URL } from "./constants";

interface GenerateLinksParams {
  oembed?: EmbedOembedSearchParams;
}

export const generateLinks = ({ oembed }: GenerateLinksParams) => [
  {
    type: "application/json+oembed",
    href: new URL($path("/embed/oembed.json", oembed ?? {}), BASE_URL).href,
  } as any,
];
