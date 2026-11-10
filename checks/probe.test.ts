// Probe for the output proof: call the functions the cleanup touched with fixed inputs and record what
// they return. The same file runs on the old and the new commit; the two recordings must be identical.
// It only uses things that are exported under the same name and path on both commits.
import { test, afterAll, expect } from 'vitest';
import { writeFileSync } from 'node:fs';

const out: Record<string, unknown> = {};

// Anything random or time-based must give the same answer on every run.
let seed = 42;
Math.random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

// A form of any value that JSON can hold and that does not depend on insertion order of Maps.
const plain = (v: unknown, depth = 0): unknown => {
  if (v instanceof Map) return [...v.entries()].map(([k, x]) => [String(k), plain(x, depth + 1)]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  if (v instanceof Set) return [...v].map((x) => plain(x, depth + 1)).sort();
  if (typeof v === 'function') return '[function]';
  if (v === undefined) return '[undefined]';
  if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
  if (Array.isArray(v)) return v.map((x) => plain(x, depth + 1));
  if (v && typeof v === 'object') return depth > 6 ? '[deep]' : Object.fromEntries(Object.entries(v as object).map(([k, x]) => [k, plain(x, depth + 1)]));
  return v;
};
const record = async (name: string, fn: () => unknown) => {
  try { out[name] = plain(await fn()); } catch (e) { out[name] = 'THROWS: ' + (e instanceof Error ? e.message : String(e)); }
};

const HEXES = ['#ff0000', '#00FF7f', '#123456', 'abcdef', '#fff', '#12', 'not-a-colour', '', '#GGGGGG', '#0a0B0c'];
const CHARS = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
const PALETTE = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#808080', '#ffaa00'];
const LEVELS = [0, 37, 128, 200, 255];

// An 8 x 4 block of cells with varied characters and colours.
function cells() {
  const m = new Map<string, { char: string; color: string; bgColor: string }>();
  for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) {
    m.set(`${x},${y}`, { char: CHARS[(x + y * 3) % CHARS.length], color: PALETTE[(x * 2 + y) % PALETTE.length], bgColor: (x + y) % 3 === 0 ? 'transparent' : PALETTE[(x + y * 5) % PALETTE.length] });
  }
  return m;
}

test('colour conversion (hexToRgb is now one shared copy)', async () => {
  const c = await import('@/utils/colorConversion');
  for (const h of HEXES) await record(`colorConversion.hexToRgb(${JSON.stringify(h)})`, () => c.hexToRgb(h));
  for (const r of LEVELS) await record(`colorConversion.rgbToHex(${r},${255 - r},${(r * 7) % 256})`, () => c.rgbToHex({ r, g: 255 - r, b: (r * 7) % 256 }));
});

test('gradients (gradientEngine used its own hexToRgb before)', async () => {
  const g = await import('@/utils/gradientEngine');
  const stops = (values: string[]) => values.map((value, i) => ({ position: i / (values.length - 1), value }));
  for (const interpolation of ['linear', 'constant', 'bayer2x2', 'bayer4x4', 'noise'] as const) {
    for (const quantizeSteps of ['infinite', 4] as const) {
      const colour = { enabled: true, stops: stops(['#ff0000', '#00ff00', '#0000ff']), interpolation, ditherStrength: 50, quantizeSteps };
      const chars = { enabled: true, stops: stops(['.', 'o', '@']), interpolation, ditherStrength: 50, quantizeSteps };
      for (const pos of [0, 0.1, 0.33, 0.5, 0.77, 1]) {
        await record(`sampleGradientProperty colour ${interpolation}/${quantizeSteps} @${pos}`, () => g.sampleGradientProperty(pos, colour as never, 3, 2));
        await record(`sampleGradientProperty char ${interpolation}/${quantizeSteps} @${pos}`, () => g.sampleGradientProperty(pos, chars as never, 5, 1));
      }
      for (const type of ['linear', 'radial'] as const) {
        const fillArea = new Set<string>(); for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) fillArea.add(`${x},${y}`);
        await record(`calculateGradientCells ${type} ${interpolation}/${quantizeSteps}`, () => g.calculateGradientCells({
          startPoint: { x: 0, y: 0 }, endPoint: { x: 7, y: 3 }, fillArea, cellAspectRatio: 0.6,
          definition: { type, character: chars, textColor: colour, backgroundColor: { ...colour, stops: stops(['#000000', '#ffffff']) } },
        } as never));
      }
    }
  }
});

test('effects (levels and hue use hexToRgb; wave warp and wiggle use deriveCanvasBounds)', async () => {
  const mods = await Promise.all([import('@/registry/effects/levels'), import('@/registry/effects/hueSaturation'), import('@/registry/effects/remapColors'),
    import('@/registry/effects/remapCharacters'), import('@/registry/effects/scatter'), import('@/registry/effects/waveWarp'), import('@/registry/effects/wiggle')]);
  for (const mod of mods) for (const [exportName, effect] of Object.entries(mod)) {
    const e = effect as { type?: string; defaultSettings?: unknown; process?: (c: unknown, s: unknown, o?: unknown) => unknown };
    if (!e || typeof e.process !== 'function') continue;
    for (const frame of [0, 3, 11]) {
      await record(`effect ${e.type ?? exportName} frame ${frame}, size from content`, () => e.process!(cells(), e.defaultSettings, { frame, frameRate: 12 }));
      await record(`effect ${e.type ?? exportName} frame ${frame}, 80x24 canvas`, () => e.process!(cells(), e.defaultSettings, { frame, frameRate: 12, canvasWidth: 80, canvasHeight: 24 }));
    }
  }
  const fx = await import('@/utils/effectsProcessing');
  await record('processLevelsEffect custom', () => fx.processLevelsEffect(cells() as never, { shadowsInput: 20, midtonesInput: 1.4, highlightsInput: 230, outputMin: 10, outputMax: 240, colorRange: { type: 'all' } } as never));
  await record('processHueSaturationEffect custom', () => fx.processHueSaturationEffect(cells() as never, { hue: 40, saturation: -20, lightness: 10, colorRange: { type: 'all' } } as never));
});

test('ASCII conversion (ColorMatcher, CharacterMapper and the mapping algorithms moved to their own files)', async () => {
  const a = await import('@/utils/asciiConverter');
  for (const [name, algo] of Object.entries(a.MAPPING_ALGORITHMS)) {
    for (const r of LEVELS) for (const g of [0, 128, 255]) for (const b of [0, 255]) {
      await record(`algorithm ${name} (${r},${g},${b})`, () => algo.mapPixelToCharacter(r, g, b, CHARS, { neighborValues: [r, g, b, 10, 200, 90, 30, 250], gradientMagnitude: (r + g) / 2, sobelX: r - g, sobelY: g - b, ditherStrength: 0.3, x: r % 7, y: g % 5 }));
    }
  }
  const M = a.ColorMatcher;
  for (const h of HEXES) await record(`ColorMatcher.hexToRgb(${JSON.stringify(h)})`, () => M.hexToRgb(h));
  for (const r of LEVELS) for (const g of [0, 128, 255]) {
    const b = (r * 3 + g) % 256;
    await record(`ColorMatcher.findClosestColor(${r},${g},${b})`, () => M.findClosestColor(r, g, b, PALETTE));
    await record(`ColorMatcher.rgbToHex(${r},${g},${b})`, () => M.rgbToHex(r, g, b));
    await record(`ColorMatcher.calculateColorDistance(${r},${g},${b})`, () => M.calculateColorDistance(r, g, b, 10, 200, 30));
    await record(`ColorMatcher.matchesColorKey(${r},${g},${b})`, () => M.matchesColorKey(r, g, b, '#808080', 60));
    await record(`ColorMatcher.ditherColor(${r},${g},${b})`, () => M.ditherColor(r, g, b, PALETTE, 0.2));
    await record(`ColorMatcher.mapColorByIndex(${r},${g},${b})`, () => M.mapColorByIndex(r, g, b, PALETTE));
  }
});

test('session import (the validators moved to their own file)', async () => {
  const { SessionImporter } = await import('@/utils/sessionImporter');
  const frame = { id: 'cf-1', name: 'Frame 1', startFrame: 0, durationFrames: 12, data: { '0,0': { char: '@', color: '#ffffff', bgColor: 'transparent' } } };
  const layer = { id: 'layer-1', name: 'Layer 1', visible: true, locked: false, solo: false, opacity: 1, contentFrames: [frame], propertyTracks: [] as unknown[] };
  const good = { version: '2.0.0', name: 'probe', canvas: { width: 80, height: 24, canvasBackgroundColor: '#000000', showGrid: true }, timeline: { frameRate: 12, durationFrames: 12, looping: true }, layers: [layer] };
  const withLayer = (patch: object) => ({ ...good, layers: [{ ...layer, ...patch }] });
  const withFrame = (patch: object) => withLayer({ contentFrames: [{ ...frame, ...patch }] });
  // Each entry breaks one thing, so each reaches a different check in the validators.
  const broken: Record<string, unknown> = {
    'not an object': 42,
    'unknown format': { hello: 'world' },
    'layers is not an array': { ...good, layers: 'nope' },
    'version from the future': { ...good, version: '9.0.0' },
    'name is a number': { ...good, name: 5 },
    'canvas missing': { ...good, canvas: undefined },
    'canvas width is text': { ...good, canvas: { ...good.canvas, width: 'wide' } },
    'canvas height is zero': { ...good, canvas: { ...good.canvas, height: 0 } },
    'canvas background is a number': { ...good, canvas: { ...good.canvas, canvasBackgroundColor: 0 } },
    'showGrid is text': { ...good, canvas: { ...good.canvas, showGrid: 'yes' } },
    'timeline missing': { ...good, timeline: undefined },
    'frame rate is zero': { ...good, timeline: { ...good.timeline, frameRate: 0 } },
    'frame rate is infinite': { ...good, timeline: { ...good.timeline, frameRate: Infinity } },
    'duration is a fraction': { ...good, timeline: { ...good.timeline, durationFrames: 0.5 } },
    'looping is text': { ...good, timeline: { ...good.timeline, looping: 'yes' } },
    'layer is text': { ...good, layers: ['layer'] },
    'layer without id': withLayer({ id: undefined }),
    'layer name is a number': withLayer({ name: 7 }),
    'layer visible is text': withLayer({ visible: 'yes' }),
    'layer opacity is not a number': withLayer({ opacity: NaN }),
    'layer parent group is a number': withLayer({ parentGroupId: 3 }),
    'layer sync flag is text': withLayer({ syncKeyframesToFrames: 'yes' }),
    'layer kind is unknown': withLayer({ kind: 'weird' }),
    'generator layer without a generator': withLayer({ kind: 'generator' }),
    'generator is text': withLayer({ kind: 'generator', generator: 'noise' }),
    'content frames is not an array': withLayer({ contentFrames: {} }),
    'content frame without a name': withFrame({ name: undefined }),
    'content frame with negative start': withFrame({ startFrame: -3 }),
    'content frame duration is zero': withFrame({ durationFrames: 0 }),
    'content frame duration is text': withFrame({ durationFrames: 'long' }),
    'content frame hidden is text': withFrame({ hidden: 'yes' }),
    'content frame label colour is a number': withFrame({ labelColor: 4 }),
    'content frame data is an array of text': withFrame({ data: 'cells' }),
    'cell is text': withFrame({ data: { '0,0': 'x' } }),
    'cell without a character': withFrame({ data: { '0,0': { color: '#fff', bgColor: 'transparent' } } }),
    'cell colour is a number': withFrame({ data: { '0,0': { char: '@', color: 1, bgColor: 'transparent' } } }),
    'property tracks is not an array': withLayer({ propertyTracks: 'none' }),
    'property track is text': withLayer({ propertyTracks: ['x'] }),
    'property track without id': withLayer({ propertyTracks: [{ propertyPath: 'transform.position.x', keyframes: [] }] }),
    'keyframe is text': withLayer({ propertyTracks: [{ id: 'pt-1', propertyPath: 'transform.position.x', keyframes: ['k'] }] }),
    'keyframe with bad easing': withLayer({ propertyTracks: [{ id: 'pt-1', propertyPath: 'transform.position.x', keyframes: [{ id: 'k1', frame: 0, value: 1, easing: 'wobbly' }] }] }),
    'keyframe with a negative frame': withLayer({ propertyTracks: [{ id: 'pt-1', propertyPath: 'transform.position.x', keyframes: [{ id: 'k1', frame: -1, value: 1, easing: 'linear' }] }] }),
    'static properties is text': withLayer({ staticProperties: 'none' }),
    'effect tracks is not an array': withLayer({ effectTracks: 'none' }),
    'effect track is text': withLayer({ effectTracks: ['x'] }),
    'effect track without id': withLayer({ effectTracks: [{ effectType: 'levels', blocks: [] }] }),
    'layer groups is not an array': { ...good, layerGroups: 'none' },
    'layer group without id': { ...good, layerGroups: [{ name: 'g', childLayerIds: [], visible: true, solo: false, locked: false, collapsed: false, propertyTracks: [] }] },
    'layer group child id is a number': { ...good, layerGroups: [{ id: 'g1', name: 'g', childLayerIds: [1], visible: true, solo: false, locked: false, collapsed: false, propertyTracks: [] }] },
    'global effects is not an array': { ...good, globalEffects: 'none' },
    'global effect is text': { ...good, globalEffects: ['x'] },
    'post effect tracks is text': { ...good, postEffectTracks: 'nope' },
    'post effect track is text': { ...good, postEffectTracks: ['x'] },
    'tools is text': { ...good, tools: 'none' },
    'tools has an unknown tool': { ...good, tools: { activeTool: 'laser' } },
  };
  for (const [name, data] of Object.entries(broken)) {
    await record(`importSessionData: ${name}`, async () => { try { await SessionImporter.importSessionData(data); return 'imported without complaint'; } catch (e) { return 'rejected: ' + (e as Error).message; } });
  }
});

afterAll(() => {
  writeFileSync('proofkit-outputs.json', JSON.stringify(out, null, 1));
  expect(Object.keys(out).length).toBeGreaterThan(100);
});
