/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node"],
  plugins: ["prefer-arrow-functions"],
  ignorePatterns: ["/functions/\\[\\[path\\]\\].js"],
  rules: {
    "prefer-arrow-functions/prefer-arrow-functions": [
      "error",
      {
        classPropertiesAllowed: false,
        disallowPrototype: false,
        returnStyle: "unchanged",
        singleReturnOnly: false,
      },
    ],
    "react/jsx-curly-brace-presence": ["error", "never"],
  },
};
