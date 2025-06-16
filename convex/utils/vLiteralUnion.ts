import { v } from "convex/values";

/**
 * Turns a readonly tuple of string literals into
 * `v.union(v.literal(...))` **without** falling back to `any`.
 *
 * @example
 * const ITEM_TYPES = ['Seed', 'Gear'] as const;
 * export const itemTypeValidator = vLiteralUnion(ITEM_TYPES);
 */
export function vLiteralUnion<
  T extends readonly [string, ...string[]], // at least one element
>(values: T) {
  return v.union(
    ...(values.map((s) => v.literal(s)) as {
      // Turn the array of validators into a fixed positional tuple
      [K in keyof T]: ReturnType<typeof v.literal<T[K]>>;
    }),
  );
}
