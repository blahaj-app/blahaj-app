import { $path } from "remix-routes";
import type { InternalOembedSearchParams } from "../zod/internal-oembed-search-params";
import { BASE_URL } from "./constants";

interface GenerateLinksParams {
  oembed?: InternalOembedSearchParams;
}

export const generateLinks = ({ oembed }: GenerateLinksParams) => [
  {
    type: "application/json+oembed",
    href: new URL($path("/internal/oembed", oembed ?? {}), BASE_URL).href,
  } as any,
];
