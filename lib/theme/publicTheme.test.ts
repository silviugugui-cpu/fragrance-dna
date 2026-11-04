import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { ACTIVE_PUBLIC_THEME, ACTIVE_PUBLIC_THEME_ASSETS, PUBLIC_THEME_ASSETS } from './publicTheme';
import { BRAND_ASSETS } from '../branding';

test('public theme stays dark while normal mode is being prepared', () => {
  assert.equal(ACTIVE_PUBLIC_THEME, 'dark');
  assert.equal(PUBLIC_THEME_ASSETS.normal, null);
  assert.deepEqual(ACTIVE_PUBLIC_THEME_ASSETS, PUBLIC_THEME_ASSETS.dark);
});

test('every active public theme asset exists locally', () => {
  for (const asset of Object.values(ACTIVE_PUBLIC_THEME_ASSETS)) {
    assert.ok(asset.startsWith('/'));
    assert.ok(existsSync(path.join(process.cwd(), 'public', asset.slice(1))), asset);
  }
});

test('both backgrounds use only the new logo kit and have local watermark assets', () => {
  for (const variants of Object.values(BRAND_ASSETS)) {
    for (const asset of Object.values(variants)) {
      assert.ok(asset.startsWith('/Logo/new-logo/'), asset);
      assert.ok(existsSync(path.join(process.cwd(), 'public', asset.slice(1))), asset);
    }
  }
  assert.equal(ACTIVE_PUBLIC_THEME_ASSETS.logo, BRAND_ASSETS.dark.logo);
});
