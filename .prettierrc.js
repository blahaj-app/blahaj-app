module.exports = {
  trailingComma: "all",
  printWidth: 120,
  importOrder: ["^reflect-metadata$", "<THIRD_PARTY_MODULES>", "^[./]"],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  plugins: [require("@trivago/prettier-plugin-sort-imports")],
};
