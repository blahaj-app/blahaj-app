# @blahaj-app/worker

Backend component. Scrapes info about current stock and expected restocks from IKEA API. Intended to be deployed to CF Workers, stores data in a D1 database using drizzle-orm.

```shell
# Install dependencies
$ pnpm install
# Start local development server with live reload
$ pnpm run dev
# Start remote development server using wrangler
$ pnpm run dev:remote
# Deploy using wrangler
$ pnpm run deploy
```
