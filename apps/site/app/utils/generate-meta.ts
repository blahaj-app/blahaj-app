import type { HtmlMetaDescriptor } from "@remix-run/cloudflare";
import { $path } from "remix-routes";
import type { EmbedOgSearchParams } from "../zod/embed-og-search-params";

type GenerateImagesParams = EmbedOgSearchParams & { cacheBust?: string };

interface GenerateMetaParams {
  title?: string;
  description?: string;
  url?: string;
  image?: GenerateImagesParams;
}

const generateImages = (params: GenerateImagesParams) => {
  const url = new URL($path("/embed/og.png", params), __baseUrl__).href;

  return {
    "og:image": url,
    "twitter:image": url,
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
