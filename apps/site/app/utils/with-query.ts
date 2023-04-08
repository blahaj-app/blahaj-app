const withQuery = <Q extends Record<string, unknown>>(route: string, query: Q) => {
  const entries = Object.entries(query).map<[string, string]>(([key, value]) => [key, String(value)]);

  return route + "?" + new URLSearchParams(entries).toString();
};

export default withQuery;
