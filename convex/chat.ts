import { components } from './_generated/api';
import { ProsemirrorSync } from '@convex-dev/prosemirror-sync';
import { type DataModel } from "./_generated/dataModel";
import type { QueryCtx } from './_generated/server';
import { getUser } from './utils/auth';

const prosemirrorSync = new ProsemirrorSync(components.prosemirrorSync);

// The 'id' parameter was previously unused. It's part of the expected signature for checkRead/checkWrite.
// We'll log it to acknowledge its presence, even if not strictly used for global chat permissions.
async function checkPermissions(ctx: QueryCtx, id: string) {
  console.log("Checking permissions for document ID:", id);
  const user = await getUser(ctx);
  if (!user) {
    throw new Error("User not authenticated. Cannot access chat.");
  }
}

export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps
} = prosemirrorSync.syncApi<DataModel>({
  checkRead: checkPermissions,
  checkWrite: checkPermissions,
});
