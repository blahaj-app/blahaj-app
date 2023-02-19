export const mapGlobalMetaTitle = (itemName: string) => `${itemName} Stock Map`;
export const mapGlobalMetaDescription = (itemName: string) => `Map of ${itemName} stock and restocks around the world.`;
export const mapStoreMetaTitle = (itemName: string, storeName: string, flag: string) =>
  `${itemName} @ ${storeName} ${flag} 🍦`;
export const mapStoreMetaDescription = (itemName: string, storeName: string, countryName: string, flag: string) =>
  `Stock and restocks of ${itemName} at ${storeName} in ${countryName} ${flag} 🍦`;
