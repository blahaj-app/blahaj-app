import type { Store } from "@blahaj-app/static";
import { COUNTRY_DATA } from "@blahaj-app/static";
import moize from "moize";

const getStoreCountryDatum = moize(
  (store: Store) => {
    const code = store.id === "538" ? "mo" : store.country;

    return { code, ...COUNTRY_DATA[code] };
  },
  { maxSize: 500 },
);

export default getStoreCountryDatum;
