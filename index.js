// Adapt callable imports while running the fix for GHSA-g3hv-75wg-m249.
// Remove when every consumer uses minimatch ≥ 11.0.1.
const real = require("minimatch-real");

function wrap(source) {
  const match = typeof source === "function" ? source : source.minimatch;
  const callable = (path, pattern, options) => match(path, pattern, options);
  Object.defineProperties(callable, Object.getOwnPropertyDescriptors(source));
  callable.defaults = (options) => wrap(source.defaults(options));
  callable.minimatch = callable;
  callable.default = callable;
  return callable;
}

module.exports = wrap(real);
