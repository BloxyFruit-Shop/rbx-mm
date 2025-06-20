/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as betterAuth from "../betterAuth.js";
import type * as crons from "../crons.js";
import type * as games from "../games.js";
import type * as http from "../http.js";
import type * as itemDetails from "../itemDetails.js";
import type * as items from "../items.js";
import type * as middlemen from "../middlemen.js";
import type * as router from "../router.js";
import type * as schemas_auth from "../schemas/auth.js";
import type * as schemas_games from "../schemas/games.js";
import type * as schemas_trade from "../schemas/trade.js";
import type * as searchTable from "../searchTable.js";
import type * as stockUpdater from "../stockUpdater.js";
import type * as stocks from "../stocks.js";
import type * as tradeAds from "../tradeAds.js";
import type * as types from "../types.js";
import type * as user from "../user.js";
import type * as utils_auth from "../utils/auth.js";
import type * as utils_vLiteralUnion from "../utils/vLiteralUnion.js";
import type * as vouches from "../vouches.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  betterAuth: typeof betterAuth;
  crons: typeof crons;
  games: typeof games;
  http: typeof http;
  itemDetails: typeof itemDetails;
  items: typeof items;
  middlemen: typeof middlemen;
  router: typeof router;
  "schemas/auth": typeof schemas_auth;
  "schemas/games": typeof schemas_games;
  "schemas/trade": typeof schemas_trade;
  searchTable: typeof searchTable;
  stockUpdater: typeof stockUpdater;
  stocks: typeof stocks;
  tradeAds: typeof tradeAds;
  types: typeof types;
  user: typeof user;
  "utils/auth": typeof utils_auth;
  "utils/vLiteralUnion": typeof utils_vLiteralUnion;
  vouches: typeof vouches;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  prosemirrorSync: {
    lib: {
      deleteDocument: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        null
      >;
      deleteSnapshots: FunctionReference<
        "mutation",
        "internal",
        { afterVersion?: number; beforeVersion?: number; id: string },
        null
      >;
      deleteSteps: FunctionReference<
        "mutation",
        "internal",
        {
          afterVersion?: number;
          beforeTs: number;
          deleteNewerThanLatestSnapshot?: boolean;
          id: string;
        },
        null
      >;
      getSnapshot: FunctionReference<
        "query",
        "internal",
        { id: string; version?: number },
        { content: null } | { content: string; version: number }
      >;
      getSteps: FunctionReference<
        "query",
        "internal",
        { id: string; version: number },
        {
          clientIds: Array<string | number>;
          steps: Array<string>;
          version: number;
        }
      >;
      latestVersion: FunctionReference<
        "query",
        "internal",
        { id: string },
        null | number
      >;
      submitSnapshot: FunctionReference<
        "mutation",
        "internal",
        {
          content: string;
          id: string;
          pruneSnapshots?: boolean;
          version: number;
        },
        null
      >;
      submitSteps: FunctionReference<
        "mutation",
        "internal",
        {
          clientId: string | number;
          id: string;
          steps: Array<string>;
          version: number;
        },
        | {
            clientIds: Array<string | number>;
            status: "needs-rebase";
            steps: Array<string>;
          }
        | { status: "synced" }
      >;
    };
  };
};
