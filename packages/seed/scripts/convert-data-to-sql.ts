import fs from "fs/promises";
import path from "path";

const escape = (str: string) => {
  return str.replace(/'/g, "''");
};

const main = async () => {
  const STORES_FILE = path.resolve(__dirname, "../data/stores.csv");

  const storesLines = (await fs.readFile(STORES_FILE, "utf-8"))
    .split("\n")
    .map((line) => line.split(","))
    .filter((line) => line.length === 5);

  const storeValues = storesLines.map(([id, name, country, latitude, longitude]) => {
    return `('${escape(id)}', '${escape(name)}', '${escape(country)}', ${latitude}, ${longitude})`;
  });

  const storesSql = `INSERT OR REPLACE INTO stores (id, name, country, latitude, longitude) VALUES
${storeValues.map((v) => "  " + v).join(",\n")};`;

  await fs.writeFile(path.resolve(__dirname, "../out/stores.sql"), storesSql);

  const ARTICLE_IDS_FILE = path.resolve(__dirname, "../data/article_ids.csv");

  const articleIDsLines = (await fs.readFile(ARTICLE_IDS_FILE, "utf-8"))
    .split("\n")
    .map((line) => line.split(","))
    .filter((line) => line.length === 3);

  const articleIDsValues = articleIDsLines
    .map(([country, blahaj, smolhaj]) => {
      const values: string[] = [];
      if (blahaj) {
        values.push(`('${escape(country)}', '${escape(blahaj)}', 'blahaj')`);
      }
      if (smolhaj) {
        values.push(`('${escape(country)}', '${escape(smolhaj)}', 'smolhaj')`);
      }
      return values;
    })
    .flat();

  const articleIDsSql = `INSERT OR REPLACE INTO article_ids (country, article_id, type) VALUES
${articleIDsValues.map((v) => "  " + v).join(",\n")};`;

  await fs.writeFile(path.resolve(__dirname, "../out/article_ids.sql"), articleIDsSql);
};
main();
