import assert from "node:assert/strict";
import test from "node:test";
import { ESLint } from "eslint";

// Use the actual root config, not a duplicated test-only rule configuration.
const eslint = new ESLint();
const ruleId = "architecture/package-boundaries";
const fixtures = [
  ["ui-native", "export {}; declare module '@app/auth' {}", 1],
  ["ui-native", "export {}; declare module 'react' {}", 0],
  ["ui-tokens", "export {}; declare module 'react-native' {}", 1],
  ["ui-native", String.raw`/// <reference path="..\..\..\apps\auth.d.ts" />`, 1],
  ["ui-native", String.raw`/// <reference path="C:\apps\auth.d.ts" />`, 1],
  ["ui-native", String.raw`import auth from '..\\..\\..\\apps/auth';`, 1],
  ["ui-tokens", '/// <reference path="theme.d.ts" />', 0],
  ["ui-native", '/// <reference types="react" />', 0],
  ["ui-native", '/// <reference path="../../../apps/auth.d.ts" />', 1],
  ["ui-tokens", '/// <reference path="../../ui-native/src/index.tsx" />', 1],
  ["ui-tokens", '/// <reference types="react-native" />', 1],
  ["ui-native", '/// <reference types="app-auth" />', 1],
  ["ui-native", '/// <reference path="/apps/auth.d.ts" />', 1],
  ["ui-native", '// <reference types="app-auth" />', 0],
  ["ui-native", `const text = '/// <reference types="app-auth" />';`, 0],
  ["ui-tokens", "import type { Theme } from './theme';", 0],
  ["ui-tokens", "export const label = 'react-native'; // import 'react-native'", 0],
  ["ui-native", "import React from 'react';", 0],
  ["ui-native", "import type { ViewProps } from 'react-native';", 0],
  ["ui-native", "export type { Theme } from '@honeydrunk/ui-tokens';", 0],
  ["ui-native", "export * from './theme';", 0],
  ["ui-native", "const theme = import('./theme');", 0],
  ["ui-tokens", "import type { ViewProps } from 'react-native';", 1],
  ["ui-tokens", "import React from 'react';", 1],
  ["ui-tokens", "export * from '@honeydrunk/ui-native';", 1],
  ["ui-tokens", "export { Button } from '../../ui-native/src';", 1],
  ["ui-tokens", "type Theme = import('@honeydrunk/ui-native').Theme;", 1],
  ["ui-native", "import { router } from 'expo-router';", 1],
  ["ui-native", "import { auth } from '@app/auth';", 1],
  ["ui-native", "export * from '@product/domain';", 1],
  ["ui-native", "import { auth } from '../../../apps/auth';", 1],
  ["ui-native", "import { auth } from './../../../apps/auth';", 1],
  ["ui-native", "import { auth } from '#auth';", 1],
  ["ui-native", "import { auth } from 'react-native/auth';", 1],
  ["ui-native", "const auth = import('@app/auth');", 1],
  ["ui-native", "const auth = require('@app/auth');", 1],
  ["ui-native", "const auth = require.resolve('@app/auth');", 1],
  ["ui-native", "const auth = require['resolve']('@app/auth');", 1],
  ["ui-native", "const auth = require['resolve'](moduleName);", 1],
  ["ui-native", "import auth from '.auth';", 1],
  ["ui-native", "import auth = require('@app/auth');", 1],
  ["ui-native", "const auth = import(moduleName);", 1],
  ["ui-native", "const auth = require(moduleName);", 1],
  ["ui-native", "function check(require, value) { return require(value); }", 0],
  ["ui-native", "function check(require, value) { return require.resolve(value); }", 0],
  ["ui-native", "function check(require, value) { return require['resolve'](value); }", 0],
  ["ui-native", "import { require } from './theme'; require(value);", 0],
  ["ui-native", "const require = (value) => value; require(value);", 0],
  ["ui-native", "function check(value) { return require(value); }", 1],
  ["ui-native", "import type { require } from './theme'; require('@app/auth');", 1],
  ["ui-native", "import { type require } from './theme'; require('@app/auth');", 1],
  ["ui-native", "type require = string; require('@app/auth');", 1],
  ["ui-native", "interface require {} require.resolve('@app/auth');", 1],
  ["ui-native", "declare function require(name: string): unknown; require('@app/auth');", 1],
  ["ui-native", "function check(require) { type require = string; return require(value); }", 0],
];

for (const extension of ["ts", "tsx", "mts", "cts"]) {
  for (const [packageName, code, expected] of fixtures) {
    test(`${packageName} .${extension} boundary: ${code}`, async () => {
      const [result] = await eslint.lintText(code, {
        filePath: `packages/${packageName}/src/boundary-fixture.${extension}`,
      });
      assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
      const messages = result.messages.filter((message) => message.ruleId === ruleId);
      assert.equal(messages.length, expected, JSON.stringify(result.messages));
      assert.ok(messages.every((message) => message.severity === 2));
    });
  }

}

test('both package source trees enable the boundary rule as an error', async () => {
  assert.ok(fixtures.some(([, , expected]) => expected === 0));
  assert.ok(fixtures.some(([, , expected]) => expected > 0));
  for (const name of ['ui-tokens', 'ui-native']) {
    for (const extension of ["ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs"]) {
      const config = await eslint.calculateConfigForFile(`packages/${name}/src/index.${extension}`);
      assert.equal(config.rules[ruleId][0], 2);
    }
  }
});

for (const extension of ["js", "jsx", "mjs", "cjs"]) {
  test(`triple-slash references in .${extension}`, async () => {
    for (const [code, expected] of [
      ['/// <reference path="theme.d.ts" />', 0],
      ['/// <reference types="app-auth" />', 1],
      [String.raw`/// <reference path="..\..\..\apps\auth.d.ts" />`, 1],
    ]) {
      const [result] = await eslint.lintText(code, { filePath: `packages/ui-native/src/fixture.${extension}` });
      assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
      assert.equal(result.messages.filter((message) => message.ruleId === ruleId).length, expected);
    }
  });
}

for (const extension of ["ts", "tsx", "mts", "cts", "d.ts", "d.mts", "d.cts"]) {
  test(`ambient declaration or augmentation in .${extension}`, async () => {
    const [result] = await eslint.lintText("declare module '@app/auth' {}", {
      filePath: `packages/ui-native/src/fixture.${extension}`,
    });
    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    const expected = extension === "mts" || extension === "cts" ? 1 : 0;
    assert.equal(result.messages.filter((message) => message.ruleId === ruleId).length, expected);
  });
}
