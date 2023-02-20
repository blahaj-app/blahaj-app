import type { LoaderArgs } from "@remix-run/cloudflare";
import type SatoriType from "satori";
// @ts-expect-error satori/wasm is not typed
import _satori, { init } from "satori/wasm";
import initYoga from "yoga-wasm-web";
import yogaWasm from "../../bin/yoga-wasm";

export const loader = async ({ params }: LoaderArgs) => {
  return initYoga(yogaWasm)
    .then((yoga) => {
      init(yoga);

      return fetch("https://t89.s3-us-west-1.amazonaws.com/2023/02/E8cSiKQU/Poppins-Bold.ttf");
    })
    .then((font) => {
      if (!font.ok) {
        throw new Response("Internal Server Error", { status: 500 });
      }

      return font.arrayBuffer();
    })
    .then((font) => {
      const satori = _satori as typeof SatoriType;

      return satori(
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
              data: font,
              weight: 700,
              style: "normal",
            },
          ],
        },
      );
    })
    .then(
      (svg) =>
        new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
          },
        }),
    );
};
