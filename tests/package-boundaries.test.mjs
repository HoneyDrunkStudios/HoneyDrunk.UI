import assert from "node:assert/strict";
import test from "node:test";
import { ESLint } from "eslint";

// Use the actual root config, not a duplicated test-only rule configuration.
const eslint = new ESLint();
const ruleId = "architecture/package-boundaries";
const fixtures = [
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
];

for (const [packageName, code, expected] of fixtures) {
  test(`${packageName} boundary: ${code}`, async () => {
    const [result] = await eslint.lintText(code, {
      filePath: `packages/${packageName}/src/boundary-fixture.ts`,
    });
    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    const messages = result.messages.filter((message) => message.ruleId === ruleId);
    assert.equal(messages.length, expected, JSON.stringify(result.messages));
    assert.ok(messages.every((message) => message.severity === 2));
  });
}

test('both package source trees enable the boundary rule as an error', async () => {
  assert.ok(fixtures.some(([, , expected]) => expected === 0));
  assert.ok(fixtures.some(([, , expected]) => expected > 0));
  for (const name of ['ui-tokens', 'ui-native']) {
    const config = await eslint.calculateConfigForFile(`packages/${name}/src/index.tsx`);
    assert.equal(config.rules[ruleId][0], 2);
  }
});
