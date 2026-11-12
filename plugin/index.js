/**
 * Host half of @local/model-pick-chip.
 *
 * The picker is a pure Client-side replacement of the composer's model seat
 * (`conversation.input.model`): it reads the per-session ModelDirectory that
 * `dsh-client-ui-model-selection` already maintains and renders a
 * provider-first two-level menu instead of one long grouped list.
 *
 * No Host behaviour is required, so `apply` stays empty. The plugin still has
 * to exist on the Host side because every installable bundle is a Cordis
 * plugin pair (a patch row plus an optional client bundle).
 */

/** Nothing to wait for on the Host side. */
export const inject = [];

/**
 * No-op Host entry point.
 */
export function apply() {}