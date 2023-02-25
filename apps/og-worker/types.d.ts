declare module "*.wasm" {
  const module: WebAssembly.Module;
  export default module;
}

declare module "*.woff" {
  const module: Uint8Array;
  export default module;
}

declare module "satori/wasm" {
  import satori from "satori";
  export default satori;
  export * from "satori";
}
