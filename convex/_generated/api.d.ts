/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as chats from "../chats.js";
import type * as migrations from "../migrations.js";
import type * as preferences from "../preferences.js";
import type * as rateLimiting from "../rateLimiting.js";
import type * as userPreferences from "../userPreferences.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  chats: typeof chats;
  migrations: typeof migrations;
  preferences: typeof preferences;
  rateLimiting: typeof rateLimiting;
  userPreferences: typeof userPreferences;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
