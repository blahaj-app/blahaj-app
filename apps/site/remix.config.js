/* eslint-disable @typescript-eslint/no-var-requires */
const { withEsbuildOverride } = require("remix-esbuild-override");

withEsbuildOverride((option, { isServer }) => {
  if (isServer)
    option.inject = [
      ...(option.inject ?? []),
      require.resolve("@esbuild-plugins/node-globals-polyfill/Buffer.js"),
      require.resolve("@esbuild-plugins/node-globals-polyfill/process.js"),
    ];

  option.legalComments = "inline";

  return option;
});

/**
 * @type {import('remix-esbuild-override').AppConfig}
 */
module.exports = {
  serverBuildTarget: "cloudflare-pages",
  server: "./server.js",
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "functions/[[path]].js",
  // publicPath: "/build/",
};
