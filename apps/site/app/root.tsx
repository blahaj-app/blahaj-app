import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import poppins400 from "@fontsource/poppins/400.css";
import poppins500 from "@fontsource/poppins/500.css";
import poppins600 from "@fontsource/poppins/600.css";
import poppins700 from "@fontsource/poppins/700.css";
import type { LinksFunction } from "@remix-run/cloudflare";
import { Links, LiveReload, Meta, Scripts, ScrollRestoration } from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css";
import type { FC } from "react";
import { useContext } from "react";
import type { TypedMetaFunction } from "remix-typedjson";
import { DynamicLinks } from "remix-utils";
import { useEffectOnce } from "usehooks-ts";
import { ClientStyleContext } from "./context";
import Layout from "./layout";
import simpleBarStyles from "./styles/simplebar.css";
import { generateMeta } from "./utils/generate-meta";

export const meta: TypedMetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",
  "og:type": "website",
  "og:site": "blahaj.app",
  "og:site_name": "blahaj.app",
  "twitter:card": "summary_large_image",
  "twitter:domain": "blahaj.app",
  "theme-color": "#5A9AAA",
  ...generateMeta({
    title: "Blåhaj Invetory Tracker",
    description: "Tracking stocks & restocks of Blåhaj (and Smolhaj) at IKEAs around the world.",
  }),
});

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: mapboxStyles },
    { rel: "stylesheet", href: simpleBarStyles },
    { rel: "stylesheet", href: poppins400 },
    { rel: "stylesheet", href: poppins500 },
    { rel: "stylesheet", href: poppins600 },
    { rel: "stylesheet", href: poppins700 },
  ];
};

const sansSerifDefault =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

const theme = extendTheme({
  colors: {
    blahaj: {
      50: "#EEF5F6",
      100: "#E1ECEF",
      200: "#C6DCE1",
      300: "#ABCBD4",
      400: "#90BBC6",
      500: "#75AAB8",
      600: "#5A9AAA",
      700: "#457A87",
      800: "#325862",
      900: "#1F373D",
    },
  },
  fonts: {
    heading: "'Poppins', " + sansSerifDefault,
    body: "'Poppins', " + sansSerifDefault,
  },
});

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <head>
          <Meta />
          <Links />
          <DynamicLinks />
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
    </QueryClientProvider>
  );
});
export default App;
