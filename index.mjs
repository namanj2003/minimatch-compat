// Adapt callable imports while running the fix for GHSA-g3hv-75wg-m249.
// Remove when every consumer uses minimatch ≥ 11.0.1.
import minimatch from "./index.js";

export default minimatch;
export { minimatch };
export const {
  Minimatch,
  filter,
  match,
  braceExpand,
  defaults,
  escape,
  unescape,
  GLOBSTAR,
  sep,
} = minimatch;
