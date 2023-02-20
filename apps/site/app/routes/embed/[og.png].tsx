import type { LoaderArgs } from "@remix-run/cloudflare";
import { serverError } from "remix-utils";
import type SatoriType from "satori";
import poppinsBoldPath from "../../media/Poppins-Bold.ttf";
import getAssetFetcher from "../../utils/get-asset-fetcher";

let initalized = false;
const initalize = async (baseUrl: string) => {
  if (initalized) return;

  // @ts-expect-error - no types
  await import("satori/wasm").then(async ({ init }) => init((await import("yoga-wasm-web/asm")).default()));

  initalized = true;
};

export const loader = async ({ params, request, context }: LoaderArgs) => {
  await initalize(request.url);

  // @ts-expect-error - no types
  const { default: _satori } = await import("satori/wasm");

  const satori = _satori as typeof SatoriType;

  const fetchAsset = getAssetFetcher(request.url);

  const [font] = await Promise.all([fetchAsset(poppinsBoldPath)]);

  const svg = await satori(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundImage: "linear-gradient(to bottom, #dbf4ff, #fff1f1)",
        fontSize: 60,
        letterSpacing: -2,
        fontWeight: 700,
        textAlign: "center",
      }}
    >
      <div
        style={{
          backgroundImage: "linear-gradient(90deg, rgb(0, 124, 240), rgb(0, 223, 216))",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Develop
      </div>
      <div
        style={{
          backgroundImage: "linear-gradient(90deg, rgb(121, 40, 202), rgb(255, 0, 128))",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Preview
      </div>
      <div
        style={{
          backgroundImage: "linear-gradient(90deg, rgb(255, 77, 77), rgb(249, 203, 40))",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Ship
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Poppins",
          data: await font.arrayBuffer(),
          weight: 700,
          style: "normal",
        },
      ],
    },
  );

  const png = await context.env.RESVG.fetch("http://example.com", { method: "POST", body: svg });
  if (!png.ok) throw serverError("Service Unavailable");

  return new Response(png.body, png);
};
