// convex/convex.config.ts
import { defineApp } from 'convex/server';
// The path below should resolve correctly if node_modules is structured as expected
// and tsconfig.json paths are working.
import prosemirrorSync from '@convex-dev/prosemirror-sync/convex.config';

const app = defineApp();
app.use(prosemirrorSync);
export default app;
