import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const requireModule = createRequire(import.meta.url);
const source = fs.readFileSync(path.join(process.cwd(), 'components', 'design-system', 'LuxuryAmbientParticles.tsx'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function mount(options: { pathname?: string; mobile?: boolean; reduced?: boolean; coarse?: boolean; hidden?: boolean; lowCpu?: boolean } = {}) {
  let now = 0;
  let nextId = 0;
  let cleanup: (() => void) | undefined;
  const pending = new Map<number, { at: number; callback: () => void }>();
  const events = new Map<string, () => void>();
  const imageBounds = { left: 100, top: 120, width: 1000, height: 700 };
  const frames: Array<{
    time: number;
    fills: number;
    lines: number;
    clipRect: number[] | null;
    clipped: boolean;
  }> = [];
  let shadowWrites = 0;
  const context = {
    clearRect() { frames.push({ time: now, fills: 0, lines: 0, clipRect: null, clipped: false }); },
    rect(x: number, y: number, width: number, height: number) {
      frames[frames.length - 1].clipRect = [x, y, width, height];
    },
    clip() { frames[frames.length - 1].clipped = true; },
    fill() { frames[frames.length - 1].fills += 1; },
    stroke() { frames[frames.length - 1].lines += 1; },
    createRadialGradient() { return { addColorStop() {} }; },
  };
  const canvas = {
    width: 0,
    height: 0,
    style: {},
    getContext: () => new Proxy(context, {
      get(target, key) { return Reflect.get(target, key) ?? (() => {}); },
      set(target, key, value) {
        if (key === 'shadowBlur' && value > 0) shadowWrites += 1;
        return Reflect.set(target, key, value);
      },
    }),
  };
  const media = new Map<string, { matches: boolean; change?: () => void; addEventListener: (name: string, callback: () => void) => void; removeEventListener: () => void }>();
  for (const [query, matches] of [
    ['(pointer: coarse)', Boolean(options.coarse)],
    ['(max-width: 899px)', Boolean(options.mobile)],
    ['(prefers-reduced-motion: reduce)', Boolean(options.reduced)],
  ] as const) {
    const item = {
      matches,
      change: undefined as (() => void) | undefined,
      addEventListener(_name: string, callback: () => void) { item.change = callback; },
      removeEventListener() { item.change = undefined; },
    };
    media.set(query, item);
  }
  const document = {
    hidden: Boolean(options.hidden),
    querySelector: () => ({ getBoundingClientRect: () => imageBounds }),
    addEventListener(name: string, callback: () => void) { events.set(`document:${name}`, callback); },
    removeEventListener(name: string) { events.delete(`document:${name}`); },
  };
  const schedule = (callback: () => void, delay: number) => {
    const id = ++nextId;
    pending.set(id, { at: now + Math.max(1, delay), callback });
    return id;
  };
  const window = {
    innerWidth: options.mobile ? 390 : 1440,
    innerHeight: 900,
    devicePixelRatio: 2,
    matchMedia: (query: string) => media.get(query),
    requestAnimationFrame: (callback: (timestamp: number) => void) => schedule(() => callback(now), 1000 / 60),
    cancelAnimationFrame: (id: number) => pending.delete(id),
    setTimeout: schedule,
    clearTimeout: (id: number) => pending.delete(id),
    addEventListener(name: string, callback: () => void) { events.set(`window:${name}`, callback); },
    removeEventListener(name: string) { events.delete(`window:${name}`); },
  };
  const module = { exports: {} as { default: () => unknown } };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, window, document,
    navigator: { hardwareConcurrency: options.lowCpu ? 4 : 8 },
    performance: { now: () => now },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    require(name: string) {
      if (name === 'react') return {
        useRef: () => ({ current: canvas }),
        useEffect: (effect: () => (() => void) | undefined) => { cleanup = effect(); },
      };
      if (name === 'next/navigation') return { usePathname: () => options.pathname ?? '/' };
      return requireModule(name);
    },
  });
  const result = module.exports.default();
  return {
    frames, pending, media, events, result, canvas,
    get shadowWrites() { return shadowWrites; },
    setImageBounds(bounds: { left: number; top: number; width: number; height: number }) {
      Object.assign(imageBounds, bounds);
    },
    advance(milliseconds: number) {
      const end = now + milliseconds;
      while (pending.size) {
        const [id, task] = [...pending.entries()].sort((a, b) => a[1].at - b[1].at)[0];
        if (task.at > end) break;
        now = task.at;
        pending.delete(id);
        task.callback();
      }
      now = end;
    },
    visibility(hidden: boolean) {
      document.hidden = hidden;
      events.get('document:visibilitychange')?.();
    },
    dispose() { cleanup?.(); },
  };
}

test('homepage limits particles, frame rate, resolution and unshadowed connections', () => {
  const instance = mount();
  instance.advance(5000);
  assert.ok(instance.frames.length >= 100 && instance.frames.length <= 150);
  for (const frame of instance.frames) {
    // Two fills per particle, one per hero glow, and one halo.
    assert.ok(frame.fills >= 45 && frame.fills <= 56);
    assert.equal(frame.lines, 12);
    assert.deepEqual(frame.clipRect, [100, 120, 1000, 700]);
    assert.equal(frame.clipped, true);
  }
  for (let index = 1; index < instance.frames.length; index += 1) {
    assert.ok(instance.frames[index].time - instance.frames[index - 1].time >= 1000 / 30);
  }
  assert.equal(instance.shadowWrites, 0);
  assert.equal(instance.canvas.width, 1800);
  assert.equal(instance.canvas.height, 1125);
  instance.dispose();
  assert.equal(instance.pending.size, 0);
  assert.equal(instance.events.size, 0);
});

test('particle clip follows the homepage image after scrolling', () => {
  const instance = mount();
  instance.advance(100);
  instance.frames.length = 0;
  instance.setImageBounds({ left: 80, top: -40, width: 900, height: 600 });
  instance.advance(100);
  assert.deepEqual(instance.frames[0].clipRect, [80, -40, 900, 600]);
  instance.dispose();
});

test('low CPU profile stays below 24 FPS and uses native CSS pixel resolution', () => {
  const instance = mount({ lowCpu: true });
  instance.advance(5000);
  assert.ok(instance.frames.length > 0 && instance.frames.length <= 120);
  for (let index = 1; index < instance.frames.length; index += 1) {
    assert.ok(instance.frames[index].time - instance.frames[index - 1].time >= 1000 / 24);
  }
  assert.equal(instance.canvas.width, 1440);
  instance.dispose();
});

for (const options of [{ mobile: true }, { coarse: true }]) {
  test(`no ambient lights on mobile: ${JSON.stringify(options)}`, () => {
    const instance = mount(options);
    assert.equal(instance.frames.length, 0);
    instance.advance(5000);
    instance.visibility(false);
    assert.equal(instance.frames.length, 0);
    assert.equal(instance.pending.size, 0);
    instance.dispose();
  });
}

for (const options of [{ reduced: true }]) {
  test(`static background without scheduled animation: ${JSON.stringify(options)}`, () => {
    const instance = mount(options);
    assert.equal(instance.frames.length, 1);
    instance.advance(5000);
    assert.equal(instance.frames.length, 1);
    assert.equal(instance.pending.size, 0);
    instance.dispose();
  });
}

test('hidden tab cancels all drawing and resumes with one loop', () => {
  const instance = mount();
  instance.advance(200);
  instance.visibility(true);
  const count = instance.frames.length;
  assert.equal(instance.pending.size, 0);
  instance.advance(5000);
  assert.equal(instance.frames.length, count);
  instance.visibility(false);
  assert.equal(instance.pending.size, 1);
  instance.advance(200);
  assert.ok(instance.frames.length > count);
  instance.dispose();
});

test('initially hidden tab does not draw', () => {
  const instance = mount({ hidden: true });
  assert.equal(instance.frames.length, 0);
  assert.equal(instance.pending.size, 0);
  instance.visibility(false);
  instance.advance(100);
  assert.ok(instance.frames.length > 0);
  instance.dispose();
});

test('motion preference and viewport changes switch between static and animated', () => {
  const instance = mount();
  instance.advance(100);
  const preference = instance.media.get('(prefers-reduced-motion: reduce)')!;
  preference.matches = true;
  preference.change?.();
  const count = instance.frames.length;
  instance.advance(1000);
  assert.equal(instance.frames.length, count);
  assert.equal(instance.pending.size, 0);
  preference.matches = false;
  preference.change?.();
  instance.advance(100);
  assert.ok(instance.frames.length > count);
  const viewport = instance.media.get('(max-width: 899px)')!;
  viewport.matches = true;
  viewport.change?.();
  assert.equal(instance.pending.size, 0);
  instance.dispose();
  assert.ok([...instance.media.values()].every((query) => query.change === undefined));
});

for (const pathname of ['/collection', '/results', '/test', '/studio']) {
  test(`no ambient canvas or animation on ${pathname}`, () => {
    const instance = mount({ pathname });
    assert.equal(instance.result, null);
    assert.equal(instance.pending.size, 0);
    assert.equal(instance.frames.length, 0);
  });
}
