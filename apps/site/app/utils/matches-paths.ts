import { matchPath } from "react-router-dom";
import type { RouteParams } from "routes-gen";

const matchesPaths = (routes: (keyof RouteParams)[], path: string): boolean =>
  routes.some((route) => matchPath(route, path) !== null);

export default matchesPaths;
