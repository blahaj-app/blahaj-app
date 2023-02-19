import { ALL_STORES } from "@blahaj-app/static";
import moize from "moize";

const findStore = moize((storeId: string) => ALL_STORES.find((store) => store.id === storeId), { maxSize: 500 });

export default findStore;
