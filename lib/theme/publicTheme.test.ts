import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { DEFAULT_PUBLIC_THEME, isPublicTheme, PUBLIC_THEME_ASSETS } from './publicTheme';
import { BRAND_ASSETS } from '../branding';

test('public theme defaults to dark and accepts only supported preferences', () => {
  assert.equal(DEFAULT_PUBLIC_THEME, 'dark');
  assert.equal(isPublicTheme('dark'), true);
  assert.equal(isPublicTheme('normal'), true);
  assert.equal(isPublicTheme('light'), false);
  assert.equal(isPublicTheme(undefined), false);
});

test('every asset for both public themes exists locally', () => {
  for (const theme of Object.values(PUBLIC_THEME_ASSETS)) {
    for (const asset of Object.values(theme)) {
      assert.ok(asset.startsWith('/'));
      assert.ok(existsSync(path.join(process.cwd(), 'public', asset.slice(1))), asset);
    }
  }
});

test('both backgrounds use only the new logo kit and have local watermark assets', () => {
  for (const variants of Object.values(BRAND_ASSETS)) {
    for (const asset of Object.values(variants)) {
      assert.ok(asset.startsWith('/Logo/new-logo/'), asset);
      assert.ok(existsSync(path.join(process.cwd(), 'public', asset.slice(1))), asset);
    }
  }
  assert.equal(PUBLIC_THEME_ASSETS.dark.logo, BRAND_ASSETS.dark.logo);
  assert.equal(PUBLIC_THEME_ASSETS.normal.logo, BRAND_ASSETS.normal.logo);
  assert.match(PUBLIC_THEME_ASSETS.normal.logo, /graphite-transparent-2x\.png$/);
  assert.match(PUBLIC_THEME_ASSETS.normal.homeHero, /white-minimal\.png$/);
  assert.equal(PUBLIC_THEME_ASSETS.normal.territoryHero, '/Territory/Territory-white.jpg');
  assert.equal(PUBLIC_THEME_ASSETS.dark.territoryHero, '/Territory/Territory.png');
});

test('grounding uses dedicated day artwork and preserves the original dark artwork', () => {
  for (const key of ['groundingNeutral', 'groundingLove', 'groundingAvoid'] as const) {
    assert.match(PUBLIC_THEME_ASSETS.normal[key], /white-mode-2x\.jpg$/);
    assert.match(PUBLIC_THEME_ASSETS.dark[key], /\.png$/);
    assert.notEqual(PUBLIC_THEME_ASSETS.normal[key], PUBLIC_THEME_ASSETS.dark[key]);
  }
});

test('normal mode editorial inks meet AA contrast on all light surfaces', () => {
  const css = readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');
  const palette = css.match(/\.page-shell\[data-theme='normal'\] \{([^}]+)\}/)?.[1];
  assert.ok(palette);
  const luminance = (hex: string) => {
    const channels = hex.match(/[\da-f]{2}/gi)!.map((channel) => {
      const value = Number.parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const token of ['primary', 'secondary', 'muted', 'soft']) {
    const ink = palette.match(new RegExp(`--public-ink-${token}: (#[\\da-f]{6})`))?.[1];
    assert.ok(ink, token);
    const surfaceTokens = ['ivory', 'ochre', 'duck-egg', 'hover'];
    const backgrounds = surfaceTokens.map((token) => {
      const color = palette.match(new RegExp(`--public-surface-${token}: (#[\\da-f]{6})`))?.[1];
      assert.ok(color, token);
      return color;
    });
    for (const background of ['#ffffff', ...backgrounds]) {
      const ratio = (luminance(background) + 0.05) / (luminance(ink) + 0.05);
      assert.ok(ratio >= 4.5, `${token} contrast ${ratio.toFixed(2)} on ${background}`);
    }
  }
});
