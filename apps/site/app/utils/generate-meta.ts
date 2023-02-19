import { $path } from "remix-routes";
import type { InternalOembedSearchParams } from "../zod/internal-oembed-search-params";
import { BASE_URL } from "./constants";

interface GenerateMetaParams {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  oembed?: InternalOembedSearchParams;
}

export const generateMeta = ({ title, description, url, image, oembed }: GenerateMetaParams) => ({
  ...(title && {
    title,
    metaTitle: { name: "title", content: title },
    "og:title": title,
    "twitter:title": title,
  }),
  ...(description && {
    description,
    "og:description": description,
    "twitter:description": description,
  }),
  ...(url && {
    "og:url": url,
    "twitter:url": url,
  }),
  ...(image && {
    "og:image": image,
    "twitter:image": image,
  }),
  oembed: {
    type: "application/json+oembed",
    href: new URL($path("/internal/oembed", oembed ?? {}), BASE_URL).href,
  },
});
