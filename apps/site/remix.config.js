/* eslint-disable @typescript-eslint/no-var-requires */
const { withEsbuildOverride } = require("remix-esbuild-override");
const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill").default;

console.log("1bruh!!");

withEsbuildOverride((option, { isServer }) => {
  if (isServer)
    option.plugins = [
      GlobalsPolyfills({
        buffer: true,
      }),
      ...option.plugins,
    ];

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
