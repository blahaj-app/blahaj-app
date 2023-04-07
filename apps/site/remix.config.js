/* eslint-disable @typescript-eslint/no-var-requires */
const { replace } = require("esbuild-plugin-replace");
const { config } = require("dotenv");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: "cloudflare-pages",
  server: "./server.js",
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "functions/[[path]].js",
  // publicPath: "/build/",
  esbuildOverride: (option) => {
    config();

    const replaceValues = {
      baseUrl: process.env.BASE_URL,
      mapboxToken: process.env.MAPBOX_TOKEN,
      sentryDsn: process.env.SENTRY_DSN,
    };

    const missingValues = Object.entries(replaceValues).filter(([, value]) => !value);
    if (missingValues.length > 0) {
      throw new Error(`Missing values: ${missingValues.map(([key]) => key).join(", ")}`);
    }

    if (option.write === false) {
      option.inject = [
        ...(option.inject ?? []),
        require.resolve("@esbuild-plugins/node-globals-polyfill/Buffer.js"),
        require.resolve("@esbuild-plugins/node-globals-polyfill/process.js"),
      ];
    }

    option.plugins = [
      ...(option.plugins ?? []),
      {
        name: "specify-loader",
        setup: ({ onResolve, onLoad }) => {
          const path = require("path");
          const fs = require("fs/promises");
          const { transform: svgr } = require("@svgr/core");

          const loaders = [
            "dataurl",
            "binary",
            {
              name: "svgr",
              getContents: async (path) => {
                const svg = await fs.readFile(path, "utf8");
                const contents = await svgr(svg, {}, { filePath: path });

                return { contents, loader: "jsx", resolveDir: __dirname };
              },
            },
          ];

          for (const loader of loaders) {
            const name = typeof loader === "string" ? loader : loader.name;
            const getContents =
              typeof loader === "string"
                ? async (path) => ({ contents: await fs.readFile(path), loader: loader })
                : loader.getContents;

            onResolve({ filter: new RegExp(`\\?${name}$`) }, (args) => {
              const pathWithoutLoader = args.path.replace(new RegExp(`\\?${name}$`), "");

              const filePath =
                pathWithoutLoader.startsWith(".") || pathWithoutLoader.startsWith("/")
                  ? path.resolve(args.resolveDir, pathWithoutLoader)
                  : require.resolve(pathWithoutLoader);

              return { path: filePath, namespace: name };
            });

            onLoad({ filter: /.*/, namespace: name }, (args) => {
              return getContents(args.path);
            });
          }
        },
      },
      replace({
        values: {
          __baseUrl__: JSON.stringify(replaceValues.baseUrl),
          __mapboxToken__: JSON.stringify(replaceValues.mapboxToken),
          __sentryDsn__: JSON.stringify(replaceValues.sentryDsn),
        },
        include: /(\.jsx?|\.tsx?)$/,
      }),
    ];
    option.legalComments = "inline";

    return option;
  },
};
