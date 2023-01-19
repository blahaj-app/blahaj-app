import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { Links, LiveReload, Meta, Scripts, ScrollRestoration } from "@remix-run/react";
import type { FC } from "react";
import { useContext } from "react";
import { useEffectOnce } from "usehooks-ts";
import { ClientStyleContext } from "./context";
import Layout from "./layout";
// import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "blahaj.app",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => {
  return [
    // { rel: "stylesheet", href: mapboxStyles },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
    },
  ];
};

const sansSerifDefault =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

const theme = extendTheme({
  fonts: {
    heading: "'Poppins', " + sansSerifDefault,
    body: "'Poppins', " + sansSerifDefault,
  },
});

const App: FC = withEmotionCache((_, emotionCache) => {
  const clientStyleData = useContext(ClientStyleContext);

  useEffectOnce(() => {
    // re-link sheet container
    emotionCache.sheet.container = document.head;
    // re-inject tags
    const tags = emotionCache.sheet.tags;
    emotionCache.sheet.flush();
    tags.forEach((tag) => {
      (emotionCache.sheet as any)._insertTag(tag);
    });
    // reset cache to reapply global styles
    clientStyleData?.reset();
  });

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <ChakraProvider theme={theme}>
          <Layout />
        </ChakraProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
});
export default App;
