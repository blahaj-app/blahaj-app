import poppinsLight from "@fontsource/poppins/files/poppins-all-300-normal.woff";
import poppinsRegular from "@fontsource/poppins/files/poppins-all-400-normal.woff";
import poppinsMedium from "@fontsource/poppins/files/poppins-all-500-normal.woff";
import poppinsSemiBold from "@fontsource/poppins/files/poppins-all-600-normal.woff";
import poppinsBold from "@fontsource/poppins/files/poppins-all-700-normal.woff";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import satori, { init } from "satori/wasm";
import initYoga from "yoga-wasm-web";
import resvgWasm from "../node_modules/@resvg/resvg-wasm/index_bg.wasm";
import yogaWasm from "../node_modules/yoga-wasm-web/dist/yoga.wasm";

let initialized = false;
const initialize = async () => {
  if (initialized) return;

  await initWasm(resvgWasm);
  console.log("ok");
  init(await initYoga(yogaWasm));
  console.log("ok2");

  initialized = true;
};

const handleRequest = async (request: Request, env: Bindings): Promise<Response> => {
  await initialize();


  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.text();

    // console.log(body)

    const svg = await satori(JSON.parse(body), {
      width: 1000,
      height: 650,
      fonts: [
        {
          name: "Poppins",
          data: poppinsLight.buffer,
          weight: 300,
          style: "normal",
        },
        {
          name: "Poppins",
          data: poppinsRegular.buffer,
          weight: 400,
          style: "normal",
        },
        {
          name: "Poppins",
          data: poppinsMedium.buffer,
          weight: 500,
          style: "normal",
        },
        {
          name: "Poppins",
          data: poppinsSemiBold.buffer,
          weight: 600,
          style: "normal",
        },
        {
          name: "Poppins",
          data: poppinsBold.buffer,
          weight: 700,
          style: "normal",
        },
      ],
      // debug: true,
    });

    const resvg = new Resvg(svg);

    const png = resvg.render().asPng();

    return new Response(png, {
      headers: {
        "content-type": "image/png",
      },
    });
  } catch(e) {
    const error = e as any;
    return new Response(error?.message ?? String(error), { status: 500 });
  }
};

export default { fetch: handleRequest };
