import { matchPath } from "react-router-dom";
import type { RouteParams } from "routes-gen";
import type { PathUnion, RemoveQuestionMarks } from "./types";

const matchesPaths = (routes: PathUnion<RemoveQuestionMarks<keyof RouteParams>>[], path: string): boolean =>
  routes.some((route) => matchPath(route, path) !== null);

export default matchesPaths;
