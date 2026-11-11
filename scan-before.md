# Code hygiene scan

Repository at commit `0a54d3edce`: 510 source files, 176,404 lines, 2,347 functions, methods and constants.

| Check | Result |
|---|---|
| Duplicated functions (identical code and meaning, 40+ tokens) | 11 groups, about 247 removable lines (0.1% of the code); 3 more groups only in test files |
| Look-alikes: same text, but each copy uses different helpers or values (not safe to merge as they are) | 0 groups; 1 more group only in test files |
| Files over 1,000 lines (too big for an AI agent to read whole) | 18 |
| Files between 500 and 1,000 lines | 51 |
| Same function name, different code, in several files | 22 names; 14 more names only in test files |
| Constants retyped as raw values elsewhere | 11 constants, 35 places |

## Duplicated functions

| Copies | Lines each | Where |
|---|---|---|
| 2 | 53 | `parseMP4FrameRate` src/utils/imageTraceProcessor.ts:196<br>`MediaProcessor.parseMP4FrameRate` src/utils/mediaProcessor.ts:419 |
| 3 | 18 | `DashedRectangleIcon` src/components/features/ToolPalette.tsx:51<br>`DashedRectangleIcon` src/components/features/ToolPalette_backup.tsx:28<br>`DashedRectangleIcon` src/components/features/ToolPalette_new.tsx:28 |
| 2 | 33 | `setupTextRendering` src/utils/canvasDPI.ts:46<br>`setupTextRendering` src/utils/canvasTextRendering.ts:46 |
| 4 | 9 | `sanitizeFileName` src/components/features/AnsiExportDialog.tsx:19<br>`sanitizeFileName` src/components/features/InkExportDialog.tsx:17<br>`sanitizeFileName` src/components/features/OpenTuiExportDialog.tsx:17<br>`sanitizeFileName` src/components/features/ReactExportDialog.tsx:16 |
| 2 | 26 | `MenuItem` src/components/features/timeline/LayerContextMenu.tsx:52<br>`MenuItem` src/components/features/timeline/TimelineContextMenu.tsx:82 |
| 2 | 20 | `interpolateBetweenKeyframes` src/types/easing.ts:210<br>`interpolateNumeric` src/utils/effectKeyframeInterpolation.ts:15 |
| 3 | 8 | `hexToRgb` src/utils/colorConversion.ts:8<br>`hexToRgb` src/utils/effectsProcessing.ts:535<br>`hexToRgb` src/utils/gradientEngine.ts:324 |
| 2 | 11 | `deriveCanvasBounds` src/registry/effects/waveWarp.ts:123<br>`deriveCanvasBounds` src/registry/effects/wiggle.ts:180 |
| 2 | 9 | `contentFrameToLegacyFrame` src/stores/animationStore.ts:38<br>`contentFrameToLegacyFrame` src/stores/animationStoreAdapter.ts:37 |
| 2 | 8 | `getActiveLayer` src/stores/animationStore.ts:28<br>`getActiveLayer` src/stores/animationStoreAdapter.ts:27 |
| 2 | 8 | `loadImage` src/utils/imageTraceProcessor.ts:162<br>`MediaProcessor.loadImage` src/utils/mediaProcessor.ts:210 |

Only in test files, listed for information: `replay` (3 copies), `resetStores` (2 copies), `snapshot` (2 copies).

## Files too big to read whole

| File | Lines |
|---|---|
| src/components/features/WelcomeAsciiAnimationData.tsx | 26,994 |
| src/components/common/AsciiMotionLogo.tsx | 8,019 |
| src/utils/exportRenderer.ts | 4,907 |
| src/stores/timelineStore.ts | 4,360 |
| src/hooks/useKeyboardShortcuts.ts | 3,203 |
| src/constants/version.ts | 1,991 |
| src/utils/asciiConverter.ts | 1,840 |
| src/components/features/MediaImportPanel.tsx | 1,604 |
| src/components/features/InteractiveBezierOverlay.tsx | 1,575 |
| src/stores/bezierStore.ts | 1,440 |
| src/stores/toolStore.ts | 1,407 |
| src/constants/bezierAutofill/blockCharacters.ts | 1,288 |
| src/components/features/ColorPickerOverlay.tsx | 1,260 |
| src/components/features/timeline/TimelineTrackArea.tsx | 1,245 |
| src/utils/sessionImporter.ts | 1,240 |
| src/types/index.ts | 1,201 |
| src/constants/bezierAutofill/ansiCharacters.ts | 1,178 |
| src/constants/bezierAutofill/ansiCharacters_backup.ts | 1,055 |

## Same name, different code

| Name | Where |
|---|---|
| `hexToRgb` | src/hooks/usePostEffectsRenderer.ts:29<br>src/utils/colorConversion.ts:8<br>src/utils/effectsProcessing.ts:535<br>src/utils/gradientEngine.ts:324<br>src/utils/gridColor.ts:8<br>src/utils/mediaImportPipeline.ts:237<br>src/utils/webgl/WebGLPostProcessor.ts:532 |
| `finalizeFileName` | src/components/features/AnsiExportDialog.tsx:29<br>src/components/features/BubbleteaExportDialog.tsx:34<br>src/components/features/InkExportDialog.tsx:27<br>src/components/features/OpenTuiExportDialog.tsx:27<br>src/components/features/ReactExportDialog.tsx:26 |
| `isRecord` | src/mcp/client.ts:73<br>src/mcp/generatorCommands.ts:66<br>src/mcp/legacyAdapters.ts:21<br>src/mcp/operations/handlers/io.ts:111 |
| `toPascalCase` | src/components/features/InkExportDialog.tsx:32<br>src/components/features/OpenTuiExportDialog.tsx:32<br>src/components/features/ReactExportDialog.tsx:31 |
| `ToolPalette` | src/components/features/ToolPalette.tsx:97<br>src/components/features/ToolPalette_backup.tsx:68<br>src/components/features/ToolPalette_new.tsx:68 |
| `rgbToHex` | src/utils/colorConversion.ts:20<br>src/utils/effectsProcessing.ts:547<br>src/utils/gradientEngine.ts:333 |
| `ColorPicker` | src/components/features/ColorPicker.tsx:26<br>src/components/features/ColorPicker_new.tsx:22 |
| `findTrackByBlockId` | src/components/features/timeline/EffectPropertiesPanel.tsx:31<br>src/hooks/useEffectBlockHistory.ts:25 |
| `ColorSwatchRow` | src/components/features/timeline/EffectPropertiesPanel.tsx:316<br>src/components/features/timeline/PostEffectPropertiesPanel.tsx:286 |
| `getPaletteById` | src/constants/bezierAutofill/index.ts:34<br>src/constants/defaultPalettes.ts:487 |
| `getFontStack` | src/constants/fonts.ts:169<br>src/lib/premium-stub.ts:393 |
| `num` | src/mcp/contract/schema.ts:49<br>src/utils/generators/generatorRuntime.ts:154 |
| `oneOf` | src/mcp/contract/schema.ts:54<br>src/mcp/operations/handlers/io.ts:72 |
| `currentFrame` | src/mcp/generatorCommands.ts:70<br>src/mcp/operations/handlers/common.ts:79 |
| `getSource` | src/mcp/generatorCommands.ts:108<br>src/utils/generators/generatorHistory.ts:14 |
| ... 7 more | | |

## Constants retyped as raw values

| Constant | Value | Defined in | Retyped | Files |
|---|---|---|---|---|
| `BTN_ICON` | `"w-3.5 h-3.5"` | src/components/features/timeline/TimelineToolbar.tsx | 13x | src/components/features/timeline/LayerContextMenu.tsx, src/components/features/timeline/LayerList.tsx, src/components/features/timeline/LayerListItem.tsx, ... |
| `CHECKERBOARD` | `"linear-gradient(45deg, #ccc 25%, transp` | src/components/features/timeline/GeneratorPropertiesPanel.tsx | 7x | src/components/features/CanvasSettings.tsx, src/components/features/ColorPicker.tsx, src/components/features/ColorPickerOverlay.tsx, ... |
| `DEFAULT_GENERATOR_CHARACTER_PALETTE_ID` | `"minimal-ascii"` | src/registry/generatorRegistry.ts | 4x | src/components/features/CharacterMappingControls.tsx, src/constants/defaultCharacterPalettes.ts, src/utils/exportDataCollector.ts |
| `DEFAULT_OUTLINE_FONT_ID` | `"jetbrains-mono"` | src/utils/font/fontRegistry.ts | 3x | src/constants/fonts.ts, src/stores/exportStore.ts, src/utils/font/fontRegistry.ts |
| `DEFAULT_ACTIVE_PALETTE_ID` | `"ansi-16"` | src/constants/defaultPalettes.ts | 2x | src/constants/defaultPalettes.ts, src/registry/generatorRegistry.ts |
| `DEFAULT_PORT` | `9876` | src/mcp/client.ts | 1x | src/components/features/MCPConnectionDialog.tsx |
| `DEFAULT_FONT` | `"ANSI Shadow"` | src/stores/asciiTypeStore.ts | 1x | src/constants/figletFonts.ts |
| `DEFAULT_EXPORT_FONT_STACK` | `"SF Mono, Monaco, Cascadia Code, Consola` | src/utils/fontStack.ts | 1x | src/constants/fonts.ts |
| `VERSION` | `"2.2.9"` | src/constants/version.ts | 1x | src/constants/version.ts |
| `BUILD_DATE` | `"2026-10-20T16:46:12.504Z"` | src/constants/version.ts | 1x | src/constants/version.ts |
| `NEWTON_EPSILON` | `1e-7` | src/types/easing.ts | 1x | src/types/easing.ts |

