/// <reference types="@types/node" />
import { ALL_STORES } from "@blahaj-app/static";
import fs from "fs/promises";
import path from "path";

const getMapboxUrl = (latitude: number, longitude: number) =>
  `https://api.mapbox.com/styles/v1/xcvr48/cledg3qwj000801oyg200h1tb/static/${longitude},${latitude},9,0/675x625?access_token=pk.eyJ1IjoieGN2cjQ4IiwiYSI6ImNsNGZ5MGZ4NDA3eTIzam1iM2p2dzByajQifQ.1GtWcbTzMu63t09MwnZAVQ&attribution=false&logo=false`;

const assertFulfilled = <T>(item: PromiseSettledResult<T>): item is PromiseFulfilledResult<T> =>
  item.status === "fulfilled";

const importsFileFormat = (imports: string[]) => `// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type ImportImage = () => Promise<typeof import("*.png")>;

export const mapImages: Record<string, ImportImage> = {
  ${imports.join("\n  ")}
};
`;

const main = async () => {
  const outDir = path.resolve(__dirname, "..", "app", "media", "map-images");

  const stores = ALL_STORES;

  console.log(`Downloading ${stores.length} images...`);

  let processed = 0;
  const images = await Promise.allSettled(
    stores.map((store) =>
      fetch(getMapboxUrl(store.latitude, store.longitude)).then(async (res) => {
        processed += 1;
        if (!res.ok) {
          console.error(`${processed}/${stores.length} Failed to download image for store ${store.id} (${store.name})`);
          throw new Error();
        }

        console.log(`${processed}/${stores.length} Downloaded image for store ${store.id} (${store.name})`);
        return { id: store.id, data: await res.arrayBuffer() };
      }),
    ),
  );

  const valid = images.filter(assertFulfilled);

  const imports = valid.map(({ value: { id } }) => `"${id}": () => import("./${id}.png"),`);

  const writes = Promise.all([
    ...valid.map(({ value: { data, id } }) => fs.writeFile(path.resolve(outDir, `${id}.png`), Buffer.from(data))),
    fs.writeFile(path.resolve(outDir, "map-images.ts"), importsFileFormat(imports)),
  ]);

  await writes;
  console.log(`Downloaded ${valid.length}/${stores.length} images`);
};
main();
