#!/usr/bin/env node
import { parsePackageSelector, readProjects } from "@pnpm/filter-workspace-packages";
import { promises as fs } from "fs";
import { globby } from "globby";
import meow from "meow";
import { basename, dirname, relative } from "path";
import { simpleGit } from "simple-git";

const SCRIPT_PATH = basename(process.argv[1]);

const cli = meow(
  `
  Usage
    $ ${SCRIPT_PATH} [--patterns=regex]... [--list-files] <path> <hash>

  Options
    --patterns, -p      Additional .gitignore-like patterns used to find/exclude files (can be specified multiple times).
    --root              Path to the root of the monorepository. Defaults to current working directory.

  Examples
    $ ${SCRIPT_PATH} packages/app/package.json
`,
  {
    allowUnknownFlags: false,
    autoHelp: false,
    description: `./${SCRIPT_PATH}`,
    flags: {
      help: { type: "boolean", alias: "h" },
      patterns: { type: "string", alias: "p", isMultiple: true },
      root: { type: "string", default: process.cwd() },
    },
    importMeta: import.meta,
  },
);

if (cli.flags.help) {
  cli.showHelp(0);
}

/**
 * @typedef ParsedCLI
 * @type {object}
 * @property {string[]} extraPatterns
 * @property {string} directory
 * @property {string} hash
 * @property {string} root
 */

/**
 * @param {ParsedCLI} cli
 */
async function main(cli) {
  const projectPath = dirname(cli.directory);

  const files = await Promise.all([
    getFilesFromPnpmSelector(`{${projectPath}}^...`, cli.root, {
      extraPatterns: cli.extraPatterns,
    }),
    getMetafilesFromPnpmSelector(`{${projectPath}}...`, cli.root, {
      extraPatterns: cli.extraPatterns,
    }),
  ]).then((files) => files.reduce((acc, cur) => acc.concat(cur), []));

  const git = simpleGit(cli.root);
  // git log --pretty=format:'%h' -10
  console.log((await git.log(["--pretty=format:'%h'", "-10"])).latest.hash);

  const diff = await git.diff([cli.hash, "--name-only"]).then((diff) => diff.split("\n").filter(Boolean));

  const cleanProjectPath = relative(cli.root, projectPath).replaceAll("\\", "/").replace(/^\.\//, "");
  const overlap = diff.some((file) => files.includes(file) || file.startsWith(cleanProjectPath));

  if (overlap) {
    console.log("true");
  } else {
    console.log("false");
  }
}

await parseCli(cli)
  .then(main)
  .catch((err) => {
    throw err;
  });

/**
 * @param {string} path
 * @returns {Promise<boolean>}
 */
async function fileExists(path) {
  try {
    await fs.stat(path);
  } catch (err) {
    return false;
  }
  return true;
}

/**
 * @param {string} selector
 * @param {string} cwd
 * @param {object=} options
 * @param {string[]=} options.extraPatterns
 * @returns {Promise<string[]>}
 */
async function getFilesFromPnpmSelector(selector, cwd, options = {}) {
  const projectPaths = await getPackagePathsFromPnpmSelector(selector, cwd);
  const patterns = projectPaths.concat(options.extraPatterns || []);
  return globby(patterns, { cwd, dot: true, gitignore: true });
}

/**
 * @param {string} selector
 * @param {string} cwd
 * @param {object=} options
 * @param {string[]=} options.extraPatterns
 * @returns {Promise<string[]>}
 */
async function getMetafilesFromPnpmSelector(selector, cwd, options = {}) {
  const [rootMetas, projectMetas] = await Promise.all([
    globby(["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"], { cwd, dot: true, gitignore: true }),
    getPackagePathsFromPnpmSelector(selector, cwd).then((paths) => {
      const patterns = paths.map((p) => `${p}/**/package.json`).concat(options.extraPatterns || []);
      return globby(patterns, { cwd, dot: true, gitignore: true });
    }),
  ]);
  return rootMetas.concat(projectMetas);
}

/**
 * @param {string} selector
 * @param {string} cwd
 * @returns {Promise<string[]>}
 */
async function getPackagePathsFromPnpmSelector(selector, cwd) {
  const projects = await readProjects(cwd, [parsePackageSelector(selector, cwd)]);
  return Object.keys(projects.selectedProjectsGraph).map((p) => relative(cwd, p).replaceAll("\\", "/"));
}

/**
 * @param {string[]} input
 * @param {object} flags
 * @returns {Promise<ParsedCLI>}
 */
async function parseCli({ input, flags }) {
  const directory = input.shift();
  if (!directory) throw new Error("Must specify path to project");
  if (!(await fileExists(directory))) throw new Error(`Path not found: ${directory}`);

  const hash = input.shift();
  if (!hash) throw new Error("Must specify hash");

  return {
    directory: directory,
    hash: hash,
    extraPatterns: flags.patterns,
    root: flags.root,
  };
}
