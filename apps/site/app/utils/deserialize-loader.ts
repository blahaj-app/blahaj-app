import type { RemixSerializedType, UseDataFunctionReturn } from "remix-typedjson";
import { deserializeRemix } from "remix-typedjson";
import type { AwaitedReturn } from "./types";

const deserializeLoader = <T extends (...args: any) => any>(data: AwaitedReturn<T>) => {
  return deserializeRemix(data as RemixSerializedType<T>) as UseDataFunctionReturn<T>;
};

export default deserializeLoader;
