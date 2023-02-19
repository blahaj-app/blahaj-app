import type { HtmlMetaDescriptor } from "@remix-run/cloudflare";

interface GenerateMetaParams {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

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
  ...(image && {
    "og:image": image,
    "twitter:image": image,
  }),
});
