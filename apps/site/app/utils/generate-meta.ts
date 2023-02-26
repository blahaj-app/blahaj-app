import type { HtmlMetaDescriptor } from "@remix-run/cloudflare";
import { $path } from "remix-routes";
import type { EmbedOgSearchParams } from "../zod/embed-og-search-params";

interface GenerateMetaParams {
  title?: string;
  description?: string;
  url?: string;
  image?: EmbedOgSearchParams;
}

const generateImages = (params: EmbedOgSearchParams) => {
  const path = $path("/embed/og.png", params);

  return {
    "og:image": path,
    "twitter:image": path,
  };
};

export const generateMeta = ({ title, description, url, image }: GenerateMetaParams): HtmlMetaDescriptor => ({
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
  ...(image && generateImages(image)),
});
