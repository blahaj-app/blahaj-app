import { route } from "routes-gen";
import type { EmbedOembedSearchParams } from "../zod/embed-oembed-search-params";
import withQuery from "./with-query";

interface GenerateLinksParams {
  oembed?: EmbedOembedSearchParams;
}

export const generateLinks = ({ oembed }: GenerateLinksParams) => [
  {
    type: "application/json+oembed",
    href: new URL(withQuery<EmbedOembedSearchParams>(route("/embed/oembed.json"), oembed ?? {}), __baseUrl__).href,
  } as any,
];
