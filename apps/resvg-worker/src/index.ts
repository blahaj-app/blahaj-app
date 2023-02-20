import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "../node_modules/@resvg/resvg-wasm/index_bg.wasm";

let initialized = false;
const initialize = async () => {
  if (initialized) return;

  await initWasm(resvgWasm);

  initialized = true;
};

const handleRequest = async (request: Request, env: Bindings): Promise<Response> => {
  await initialize();

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // get body as string
    const body = await request.text();

    const resvg = new Resvg(body);

    const png = resvg.render().asPng();

    return new Response(png, {
      headers: {
        "content-type": "image/png",
      },
    });
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
};

export default { fetch: handleRequest };
