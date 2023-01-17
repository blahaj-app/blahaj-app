import createCache from "@emotion/cache";

export const createEmotionCache = () => createCache({ key: "cha" });
export const defaultCache = createEmotionCache();
