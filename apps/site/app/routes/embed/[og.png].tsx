/* eslint-disable jsx-a11y/anchor-is-valid */
import poppinsBold from "@fontsource/poppins/files/poppins-all-700-normal.woff";
import type { LoaderArgs } from "@remix-run/cloudflare";
import { serverError } from "remix-utils";
import type SatoriType from "satori";

let initalized = false;
const initalize = async (baseUrl: string) => {
  if (initalized) return;

  // @ts-expect-error - no types
  const [{ init }, { default: yoga }] = await Promise.all([import("satori/wasm"), import("yoga-wasm-web/asm")]);
  init(yoga());

  initalized = true;
};

export const loader = async ({ params, request, context }: LoaderArgs) => {
  await initalize(request.url);

  // @ts-expect-error - no types
  const { default: _satori } = await import("satori/wasm");

  const satori = _satori as typeof SatoriType;

  const svg = await satori(
    <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div tw="bg-gray-50 flex w-full">
        <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
          <h2 tw="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left">
            <span>Ready to dive in?</span>
            <span tw="text-indigo-600">Start your free trial today.</span>
          </h2>
          <div tw="mt-8 flex md:mt-0">
            <div tw="flex rounded-md shadow">
              <a tw="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white">
                Get started
              </a>
            </div>
            <div tw="ml-3 flex rounded-md shadow">
              <a tw="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 800,
      height: 178,
      fonts: [
        {
          name: "Poppins",
          data: poppinsBold.buffer,
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
