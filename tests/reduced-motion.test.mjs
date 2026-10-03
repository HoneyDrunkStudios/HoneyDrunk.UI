import test from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import ts from "typescript";

// Load the platform-neutral adapter without mocking React or native rendering.
const source = readFileSync(
  new URL("../packages/ui-native/src/reducedMotion.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { createReducedMotionStore } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
function harness() {
  const connections = [];
  const queries = [];
  const host = {
    addEventListener(event, callback) {
      assert.equal(event, "reduceMotionChanged");
      const connection = { callback, removals: 0 };
      connections.push(connection);
      return { remove: () => connection.removals++ };
    },
    isReduceMotionEnabled() {
      const query = deferred();
      queries.push(query);
      return query.promise;
    },
  };
  return { store: createReducedMotionStore(host), connections, queries };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));

for (const removed of [0, 1]) {
  test(`one host subscription survives removing subscriber ${removed + 1}`, async () => {
    const { store, connections, queries } = harness();
    const seen = [[], []];
    const stops = seen.map((values) =>
      store.subscribe(() => values.push(store.getSnapshot())),
    );
    assert.equal(connections.length, 1);
    assert.equal(queries.length, 1);
    assert.equal(store.getSnapshot(), true);
    queries[0].resolve(false);
    await flush();
    assert.deepEqual(seen, [[false], [false]]);
    stops[removed]();
    assert.equal(connections[0].removals, 0);
    connections[0].callback(true);
    assert.deepEqual(seen[removed], [false]);
    assert.deepEqual(seen[1 - removed], [false, true]);
    stops[1 - removed]();
    assert.equal(connections[0].removals, 1);
    assert.equal(store.getSnapshot(), true);
    const stop = store.subscribe(() => {});
    stops[removed]();
    assert.equal(connections[1].removals, 0);
    stop();
    assert.equal(connections[1].removals, 1);
  });
}

test("a newer preference event wins over an outstanding initial query", async () => {
  const { store, connections, queries } = harness();
  const stop = store.subscribe(() => {});
  // Even an event matching the static fallback invalidates the older query.
  connections[0].callback(true);
  queries[0].resolve(false);
  await flush();
  assert.equal(store.getSnapshot(), true);
  connections[0].callback(false);
  assert.equal(store.getSnapshot(), false);
  assert.equal(store.getServerSnapshot(), true);
  stop();
});

test("events and queries from a disposed connection cannot change a new connection", async () => {
  const { store, connections, queries } = harness();
  const stopFirst = store.subscribe(() => {});
  stopFirst();
  const seen = [];
  const stopSecond = store.subscribe(() => seen.push(store.getSnapshot()));
  queries[0].resolve(false);
  connections[0].callback(false);
  await flush();
  assert.equal(store.getSnapshot(), true);
  assert.deepEqual(seen, []);
  queries[1].resolve(false);
  await flush();
  assert.deepEqual(seen, [false]);
  connections[0].callback(true);
  assert.equal(store.getSnapshot(), false);
  stopSecond();
});

test("a failed preference query stays static and later events still work", async () => {
  const { store, connections, queries } = harness();
  const stop = store.subscribe(() => {});
  queries[0].reject(new Error("host unavailable"));
  await flush();
  assert.equal(store.getSnapshot(), true);
  connections[0].callback(false);
  assert.equal(store.getSnapshot(), false);
  stop();
});

test("an unavailable host subscription can be cleaned up safely", async () => {
  const store = createReducedMotionStore({
    addEventListener: () => undefined,
    isReduceMotionEnabled: async () => true,
  });
  const stop = store.subscribe(() => {});
  await flush();
  assert.equal(store.getSnapshot(), true);
  assert.doesNotThrow(stop);
});
