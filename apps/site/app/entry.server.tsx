import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import type { EntryContext, HandleDocumentRequestFunction } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { renderToString } from "react-dom/server";
import { createEmotionCache } from "./create-emotion-cache";

Sentry.init({
  dsn: __sentryDsn__,
  tracesSampleRate: 1,
});

const cache = createEmotionCache();

const handleRequest: HandleDocumentRequestFunction = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) => {
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

  const markup = renderToString(
    <CacheProvider value={cache}>
      <RemixServer context={remixContext} url={request.url} />
    </CacheProvider>,
  );

  const chunks = extractCriticalToChunks(markup);
  const styles = constructStyleTagsFromChunks(chunks);

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup.replace("</head>", styles + "</head>"), {
    status: responseStatusCode,
    headers: responseHeaders,
  });
};
export default handleRequest;
