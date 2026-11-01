const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");

test("CommonJS export stays callable and matches TypeScript paths", () => {
  const m = require("minimatch-compat");
  assert.equal(typeof m, "function");
  assert.equal(m("a/b.ts", "**/*.ts"), true);
  assert.equal(m("a/b.js", "**/*.ts"), false);
});

test("Minimatch constructor comes from the real patched module", () => {
  const m = require("minimatch-compat");
  const real = require("minimatch-real");
  assert.equal(m.Minimatch, real.Minimatch);
  assert.equal(new m.Minimatch("*.ts").match("x.ts"), true);
});

test("callable preserves every real own export and self aliases", () => {
  const m = require("minimatch-compat");
  const real = require("minimatch-real");
  assert.equal(m.minimatch, m);
  assert.equal(m.default, m);
  for (const key of Reflect.ownKeys(real)) {
    assert.ok(Object.hasOwn(m, key), `missing export ${String(key)}`);
    if (key !== "minimatch" && key !== "defaults") {
      assert.equal(m[key], real[key], `changed export ${String(key)}`);
    }
  }
});

test("defaults are callable, preserve exports and allow chained option overrides", () => {
  const m = require("minimatch-compat");
  const dotted = m.defaults({ dot: true });
  assert.equal(typeof dotted, "function");
  assert.equal(dotted(".a", "*"), true);
  assert.equal(dotted(".a", "*", { dot: false }), false);
  assert.equal(dotted.minimatch, dotted);
  assert.equal(dotted.default, dotted);
  assert.equal(new dotted.Minimatch("*").match(".a"), true);
  assert.deepEqual([".a", "b"].filter(dotted.filter("*")), [".a", "b"]);
  const chained = dotted.defaults({ nocase: true });
  assert.equal(chained(".A", ".a"), true);
  assert.equal(chained.minimatch, chained);
  assert.equal(chained.default, chained);
  assert.equal(m.defaults({}).default(".a", "*"), false);
});

test("real helpers remain available, including makeRe only when upstream exports it", () => {
  const m = require("minimatch-compat");
  const real = require("minimatch-real");
  assert.equal(typeof m.filter, "function");
  assert.deepEqual(["x.ts", "x.js"].filter(m.filter("*.ts")), ["x.ts"]);
  assert.equal(typeof m.escape, "function");
  assert.equal(m(m.escape("*"), m.escape("*")), false);
  assert.equal(m("*", m.escape("*")), true);
  assert.equal(typeof m.GLOBSTAR, "symbol");
  if (Object.hasOwn(real, "makeRe")) {
    assert.equal(m.makeRe, real.makeRe);
    assert.equal(m.makeRe("*.ts").test("x.ts"), true);
  }
});

test("native ESM default and named imports share the CommonJS callable and helpers", async () => {
  const esm = await import("minimatch-compat");
  const m = require("minimatch-compat");
  assert.equal(esm.default, m);
  assert.equal(esm.minimatch, m);
  assert.equal(esm.default("a/b.ts", "**/*.ts"), true);
  assert.equal(esm.minimatch("a/b.ts", "**/*.ts"), true);
  assert.equal(new esm.Minimatch("*.ts").match("x.ts"), true);
  assert.equal(esm.defaults({ dot: true })(".a", "*"), true);
  for (const key of Object.keys(require("minimatch-real"))) {
    assert.equal(esm[key], m[key], `ESM export ${key}`);
  }
});

test("underlying package is minimatch 11.0.3 and provides the matching implementation", () => {
  const pkg = JSON.parse(readFileSync(require.resolve("minimatch-real/package.json"), "utf8"));
  assert.equal(pkg.name, "minimatch");
  assert.equal(pkg.version, "11.0.3");
  const m = require("minimatch-compat");
  const real = require("minimatch-real");
  assert.equal(m.Minimatch, real.Minimatch);
  assert.equal(m.defaults({ dot: true })(".a", "*"), real.minimatch.defaults({ dot: true })(".a", "*"));
});
