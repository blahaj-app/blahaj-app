const getAssetFetcher = (baseUrl: string) => {
  return async (asset: string) => {
    const url = new URL(asset, baseUrl);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${url}`);
    }

    return response;
  };
};

export default getAssetFetcher;
