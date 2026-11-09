import type { Tool } from '../types';
import type { SessionDataV2 } from '../types/timeline';
import type { CharacterMappingSettings } from '../types/palette';
import { isColorPalette, isCharacterPalette } from '../types/palette';

const VALID_TOOLS = new Set<Tool>([
  'pencil',
  'eraser',
  'paintbucket',
  'select',
  'lasso',
  'magicwand',
  'rectangle',
  'ellipse',
  'eyedropper',
  'line',
  'text',
  'asciitype',
  'asciibox',
  'brush',
  'beziershape',
  'gradientfill',
  'fliphorizontal',
  'flipvertical',
  'layertransform',
]);

const VALID_MAPPING_METHODS = new Set<CharacterMappingSettings['mappingMethod']>([
  'brightness',
  'luminance',
  'contrast',
  'edge-detection',
  'saturation',
  'red-channel',
  'green-channel',
  'blue-channel',
]);

function invalidSession(path: string, expectation: string): never {
  throw new Error(`Invalid v2 session: ${path} ${expectation}`);
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    invalidSession(path, 'must be an object');
  }
  return value as Record<string, unknown>;
}

function requireArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    invalidSession(path, 'must be an array');
  }
  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    invalidSession(path, 'must be a string');
  }
  return value;
}

function requireBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    invalidSession(path, 'must be a boolean');
  }
  return value;
}

function requireFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    invalidSession(path, 'must be a finite number');
  }
  return value;
}

function requireFrameNumber(value: unknown, path: string, minimum: number): number {
  const frame = requireFiniteNumber(value, path);
  if (!Number.isSafeInteger(frame) || frame < minimum) {
    invalidSession(path, `must be an integer >= ${minimum}`);
  }
  return frame;
}

function validateOptionalString(
  record: Record<string, unknown>,
  property: string,
  path: string,
): void {
  if (record[property] !== undefined) {
    requireString(record[property], `${path}.${property}`);
  }
}

function validateOptionalBoolean(
  record: Record<string, unknown>,
  property: string,
  path: string,
): void {
  if (record[property] !== undefined) {
    requireBoolean(record[property], `${path}.${property}`);
  }
}

function validateEasing(value: unknown, path: string): void {
  const easing = requireRecord(value, path);
  requireString(easing.type, `${path}.type`);
  for (const property of ['x1', 'y1', 'x2', 'y2']) {
    if (easing[property] !== undefined) {
      requireFiniteNumber(easing[property], `${path}.${property}`);
    }
  }
}

function validateKeyframe(
  value: unknown,
  path: string,
  allowStringRecord: boolean,
): void {
  const keyframe = requireRecord(value, path);
  requireString(keyframe.id, `${path}.id`);
  requireFrameNumber(keyframe.frame, `${path}.frame`, 0);

  const keyframeValue = keyframe.value;
  const primitiveValue = typeof keyframeValue === 'string'
    || typeof keyframeValue === 'boolean'
    || (typeof keyframeValue === 'number' && Number.isFinite(keyframeValue));
  const stringRecordValue = allowStringRecord
    && typeof keyframeValue === 'object'
    && keyframeValue !== null
    && !Array.isArray(keyframeValue)
    && Object.values(keyframeValue).every((entry) => typeof entry === 'string');
  if (!primitiveValue && !stringRecordValue) {
    invalidSession(`${path}.value`, 'has an unsupported value');
  }

  validateEasing(keyframe.easing, `${path}.easing`);
}

function validatePropertyTrack(
  value: unknown,
  path: string,
  allowStringRecord: boolean,
): void {
  const track = requireRecord(value, path);
  requireString(track.id, `${path}.id`);
  requireString(track.propertyPath, `${path}.propertyPath`);
  requireBoolean(track.loopKeyframes, `${path}.loopKeyframes`);
  requireArray(track.keyframes, `${path}.keyframes`).forEach((keyframe, index) => {
    validateKeyframe(keyframe, `${path}.keyframes[${index}]`, allowStringRecord);
  });
}

function validateEffectTrack(value: unknown, path: string): void {
  const track = requireRecord(value, path);
  requireString(track.id, `${path}.id`);
  if (track.ownerId !== null) {
    requireString(track.ownerId, `${path}.ownerId`);
  }
  requireBoolean(track.collapsed, `${path}.collapsed`);

  const block = requireRecord(track.effectBlock, `${path}.effectBlock`);
  requireString(block.id, `${path}.effectBlock.id`);
  requireString(block.effectType, `${path}.effectBlock.effectType`);
  requireFrameNumber(block.startFrame, `${path}.effectBlock.startFrame`, 0);
  requireFrameNumber(block.durationFrames, `${path}.effectBlock.durationFrames`, 1);
  requireBoolean(block.enabled, `${path}.effectBlock.enabled`);
  requireRecord(block.settings, `${path}.effectBlock.settings`);
  requireArray(block.propertyTracks, `${path}.effectBlock.propertyTracks`).forEach(
    (propertyTrack, index) => {
      validatePropertyTrack(
        propertyTrack,
        `${path}.effectBlock.propertyTracks[${index}]`,
        true,
      );
    },
  );
}

function validateGeneratorSource(value: unknown, path: string): void {
  const source = requireRecord(value, path);
  requireString(source.id, `${path}.id`);
  requireString(source.generatorType, `${path}.generatorType`);
  requireFrameNumber(source.startFrame, `${path}.startFrame`, 0);
  requireFrameNumber(source.durationFrames, `${path}.durationFrames`, 1);
  requireBoolean(source.enabled, `${path}.enabled`);
  requireRecord(source.settings, `${path}.settings`);
  requireArray(source.propertyTracks, `${path}.propertyTracks`).forEach(
    (propertyTrack, index) => {
      validatePropertyTrack(propertyTrack, `${path}.propertyTracks[${index}]`, true);
    },
  );
}

function validatePostEffectTrack(value: unknown, path: string): void {
  const track = requireRecord(value, path);
  requireString(track.id, `${path}.id`);
  requireBoolean(track.collapsed, `${path}.collapsed`);

  const block = requireRecord(track.effectBlock, `${path}.effectBlock`);
  requireString(block.id, `${path}.effectBlock.id`);
  requireString(block.postEffectType, `${path}.effectBlock.postEffectType`);
  requireFrameNumber(block.startFrame, `${path}.effectBlock.startFrame`, 0);
  requireFrameNumber(block.durationFrames, `${path}.effectBlock.durationFrames`, 1);
  requireBoolean(block.enabled, `${path}.effectBlock.enabled`);
  requireRecord(block.settings, `${path}.effectBlock.settings`);
  requireArray(block.propertyTracks, `${path}.effectBlock.propertyTracks`).forEach(
    (propertyTrack, index) => {
      validatePropertyTrack(
        propertyTrack,
        `${path}.effectBlock.propertyTracks[${index}]`,
        false,
      );
    },
  );
}

function validateStaticProperties(value: unknown, path: string): void {
  const properties = requireRecord(value, path);
  for (const [property, propertyValue] of Object.entries(properties)) {
    requireFiniteNumber(propertyValue, `${path}.${property}`);
  }
}

export function validateSessionDataV2ForImport(value: unknown): asserts value is SessionDataV2 {
  const session = requireRecord(value, 'session');
  if (session.version !== '2.0.0' && session.version !== '2.1.0' && session.version !== '2.2.0') {
    invalidSession('session.version', 'must be 2.0.0, 2.1.0 or 2.2.0');
  }
  validateOptionalString(session, 'name', 'session');
  validateOptionalString(session, 'description', 'session');

  const canvas = requireRecord(session.canvas, 'session.canvas');
  requireFrameNumber(canvas.width, 'session.canvas.width', 1);
  requireFrameNumber(canvas.height, 'session.canvas.height', 1);
  requireString(canvas.canvasBackgroundColor, 'session.canvas.canvasBackgroundColor');
  requireBoolean(canvas.showGrid, 'session.canvas.showGrid');

  const timeline = requireRecord(session.timeline, 'session.timeline');
  const frameRate = requireFiniteNumber(timeline.frameRate, 'session.timeline.frameRate');
  if (frameRate <= 0) {
    invalidSession('session.timeline.frameRate', 'must be greater than zero');
  }
  requireFrameNumber(
    timeline.durationFrames,
    'session.timeline.durationFrames',
    1,
  );
  requireBoolean(timeline.looping, 'session.timeline.looping');

  requireArray(session.layers, 'session.layers').forEach((layerValue, layerIndex) => {
    const path = `session.layers[${layerIndex}]`;
    const layer = requireRecord(layerValue, path);
    requireString(layer.id, `${path}.id`);
    requireString(layer.name, `${path}.name`);
    requireBoolean(layer.visible, `${path}.visible`);
    requireBoolean(layer.solo, `${path}.solo`);
    requireBoolean(layer.locked, `${path}.locked`);
    requireFiniteNumber(layer.opacity, `${path}.opacity`);
    validateOptionalString(layer, 'parentGroupId', path);
    validateOptionalBoolean(layer, 'syncKeyframesToFrames', path);

    requireArray(layer.contentFrames, `${path}.contentFrames`).forEach(
      (frameValue, frameIndex) => {
        const framePath = `${path}.contentFrames[${frameIndex}]`;
        const frame = requireRecord(frameValue, framePath);
        requireString(frame.id, `${framePath}.id`);
        requireString(frame.name, `${framePath}.name`);
        requireFrameNumber(
          frame.startFrame,
          `${framePath}.startFrame`,
          0,
        );
        requireFrameNumber(
          frame.durationFrames,
          `${framePath}.durationFrames`,
          1,
        );
        validateOptionalBoolean(frame, 'hidden', framePath);
        validateOptionalString(frame, 'labelColor', framePath);

        const data = requireRecord(frame.data, `${framePath}.data`);
        for (const [cellKey, cellValue] of Object.entries(data)) {
          const cellPath = `${framePath}.data.${cellKey}`;
          const cell = requireRecord(cellValue, cellPath);
          requireString(cell.char, `${cellPath}.char`);
          requireString(cell.color, `${cellPath}.color`);
          requireString(cell.bgColor, `${cellPath}.bgColor`);
        }
      },
    );

    requireArray(layer.propertyTracks, `${path}.propertyTracks`).forEach(
      (propertyTrack, index) => {
        validatePropertyTrack(propertyTrack, `${path}.propertyTracks[${index}]`, false);
      },
    );
    if (layer.staticProperties !== undefined) {
      validateStaticProperties(layer.staticProperties, `${path}.staticProperties`);
    }
    if (layer.effectTracks !== undefined) {
      requireArray(layer.effectTracks, `${path}.effectTracks`).forEach(
        (effectTrack, index) => {
          validateEffectTrack(effectTrack, `${path}.effectTracks[${index}]`);
        },
      );
    }
    if (layer.kind !== undefined && layer.kind !== 'content' && layer.kind !== 'generator') {
      invalidSession(`${path}.kind`, 'must be "content" or "generator"');
    }
    if (layer.generator !== undefined) {
      validateGeneratorSource(layer.generator, `${path}.generator`);
    } else if (layer.kind === 'generator') {
      invalidSession(`${path}.generator`, 'is required for generator layers');
    }
  });

  if (session.layerGroups !== undefined) {
    requireArray(session.layerGroups, 'session.layerGroups').forEach(
      (groupValue, groupIndex) => {
        const path = `session.layerGroups[${groupIndex}]`;
        const group = requireRecord(groupValue, path);
        requireString(group.id, `${path}.id`);
        requireString(group.name, `${path}.name`);
        requireArray(group.childLayerIds, `${path}.childLayerIds`).forEach(
          (layerId, index) => requireString(layerId, `${path}.childLayerIds[${index}]`),
        );
        requireBoolean(group.visible, `${path}.visible`);
        requireBoolean(group.solo, `${path}.solo`);
        requireBoolean(group.locked, `${path}.locked`);
        requireBoolean(group.collapsed, `${path}.collapsed`);
        requireArray(group.propertyTracks, `${path}.propertyTracks`).forEach(
          (propertyTrack, index) => {
            validatePropertyTrack(propertyTrack, `${path}.propertyTracks[${index}]`, false);
          },
        );
        if (group.staticProperties !== undefined) {
          validateStaticProperties(group.staticProperties, `${path}.staticProperties`);
        }
        if (group.effectTracks !== undefined) {
          requireArray(group.effectTracks, `${path}.effectTracks`).forEach(
            (effectTrack, index) => {
              validateEffectTrack(effectTrack, `${path}.effectTracks[${index}]`);
            },
          );
        }
      },
    );
  }

  if (session.globalEffects !== undefined) {
    requireArray(session.globalEffects, 'session.globalEffects').forEach(
      (effectTrack, index) => {
        validateEffectTrack(effectTrack, `session.globalEffects[${index}]`);
      },
    );
  }
  if (session.postEffectTracks !== undefined) {
    requireArray(session.postEffectTracks, 'session.postEffectTracks').forEach(
      (effectTrack, index) => {
        validatePostEffectTrack(effectTrack, `session.postEffectTracks[${index}]`);
      },
    );
  }

  if (session.tools !== undefined) {
    const tools = requireRecord(session.tools, 'session.tools');
    if (
      tools.activeTool !== undefined
      && (
        typeof tools.activeTool !== 'string'
        || !VALID_TOOLS.has(tools.activeTool as Tool)
      )
    ) {
      invalidSession('session.tools.activeTool', 'must be a supported tool');
    }
    validateOptionalString(tools, 'selectedColor', 'session.tools');
    validateOptionalString(tools, 'selectedBgColor', 'session.tools');
    validateOptionalString(tools, 'selectedCharacter', 'session.tools');
    validateOptionalBoolean(tools, 'rectangleFilled', 'session.tools');
  }

  if (session.palettes !== undefined) {
    const palettes = requireRecord(session.palettes, 'session.palettes');
    validateOptionalString(palettes, 'activePaletteId', 'session.palettes');
    if (palettes.customPalettes !== undefined) {
      const customPalettes = requireArray(
        palettes.customPalettes,
        'session.palettes.customPalettes',
      );
      if (!customPalettes.every(isColorPalette)) {
        invalidSession(
          'session.palettes.customPalettes',
          'must contain valid color palettes',
        );
      }
    }
    if (palettes.recentColors !== undefined) {
      requireArray(palettes.recentColors, 'session.palettes.recentColors').forEach(
        (color, index) => requireString(color, `session.palettes.recentColors[${index}]`),
      );
    }
  }

  if (session.characterPalettes !== undefined) {
    const palettes = requireRecord(
      session.characterPalettes,
      'session.characterPalettes',
    );
    validateOptionalString(
      palettes,
      'activePaletteId',
      'session.characterPalettes',
    );
    if (palettes.customPalettes !== undefined) {
      const customPalettes = requireArray(
        palettes.customPalettes,
        'session.characterPalettes.customPalettes',
      );
      if (!customPalettes.every(isCharacterPalette)) {
        invalidSession(
          'session.characterPalettes.customPalettes',
          'must contain valid character palettes',
        );
      }
    }
    if (palettes.mappingMethod !== undefined) {
      if (
        typeof palettes.mappingMethod !== 'string'
        || !VALID_MAPPING_METHODS.has(
          palettes.mappingMethod as CharacterMappingSettings['mappingMethod'],
        )
      ) {
        invalidSession(
          'session.characterPalettes.mappingMethod',
          'must be a supported mapping method',
        );
      }
    }
    validateOptionalBoolean(
      palettes,
      'invertDensity',
      'session.characterPalettes',
    );
    if (palettes.characterSpacing !== undefined) {
      requireFiniteNumber(
        palettes.characterSpacing,
        'session.characterPalettes.characterSpacing',
      );
    }
  }

  if (session.typography !== undefined) {
    const typography = requireRecord(session.typography, 'session.typography');
    for (const property of ['fontSize', 'characterSpacing', 'lineSpacing']) {
      if (typography[property] !== undefined) {
        requireFiniteNumber(typography[property], `session.typography.${property}`);
      }
    }
    validateOptionalString(typography, 'selectedFontId', 'session.typography');
  }
}
