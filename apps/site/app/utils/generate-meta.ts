interface GenerateMetaParams {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export const generateMeta = ({ title, description, url, image }: GenerateMetaParams) => ({
  ...(title && {
    title,
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
