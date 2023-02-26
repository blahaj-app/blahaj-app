import { matchPath } from "react-router-dom";
import type { Routes } from "remix-routes";

const matchesPaths = (routes: (keyof Routes)[], path: string): boolean =>
  routes.some((route) => matchPath(route, path) !== null);

export default matchesPaths;
