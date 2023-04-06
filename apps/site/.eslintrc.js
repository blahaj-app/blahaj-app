/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node"],
  plugins: [],
  ignorePatterns: ["/functions/\\[\\[path\\]\\].js"],
  rules: {
    "react/jsx-curly-brace-presence": ["error", "never"],
  },
};
