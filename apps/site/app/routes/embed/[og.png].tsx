import type { LoaderArgs } from "@remix-run/cloudflare";
import type SatoriType from "satori";
// @ts-expect-error satori/wasm is not typed
import _satori, { init } from "satori/wasm";
import initYoga from "yoga-wasm-web";
import yogaWasm from "../../bin/yoga-wasm";

export const loader = async ({ params }: LoaderArgs) => {
  const yoga = await initYoga(yogaWasm);

  await init(yoga);

  const font = await fetch("https://t89.s3-us-west-1.amazonaws.com/2023/02/E8cSiKQU/Poppins-Bold.ttf");
  if (!font.ok) {
    throw new Error("Failed to load font");
  }

  console.log("Loaded font", font.url);

  const satori = _satori as typeof SatoriType;

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

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
};
