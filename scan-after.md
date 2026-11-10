# Code hygiene scan

Repository at commit `cf7c142699`: 510 source files, 173,468 lines, 2,317 functions, methods and constants.

| Check | Result |
|---|---|
| Duplicated functions (identical code and meaning, 40+ tokens) | 6 groups, about 111 removable lines (0.1% of the code) |
| Look-alikes: same text, but each copy uses different helpers or values (not safe to merge as they are) | 1 groups |
| Files over 1,000 lines (too big for an AI agent to read whole) | 16 |
| Files between 500 and 1,000 lines | 50 |
| Same function name, different code, in several files | 34 names |
| Constants retyped as raw values elsewhere | 24 constants, 620 places |

## Duplicated functions

| Copies | Lines each | Where |
|---|---|---|
| 2 | 53 | `parseMP4FrameRate` src/utils/imageTraceProcessor.ts:196<br>`MediaProcessor.parseMP4FrameRate` src/utils/mediaProcessor.ts:419 |
| 2 | 20 | `interpolateBetweenKeyframes` src/types/easing.ts:210<br>`interpolateNumeric` src/utils/effectKeyframeInterpolation.ts:15 |
| 3 | 7 | `replay` src/__tests__/animatedText.test.tsx:55<br>`replay` src/__tests__/generatorHistory.test.tsx:35<br>`replay` src/__tests__/particleGenerator.test.tsx:40 |
| 2 | 10 | `resetStores` src/__tests__/phase5ExportMigration.test.ts:24<br>`resetStores` src/__tests__/phase6Integration.test.ts:23 |
| 2 | 8 | `loadImage` src/utils/imageTraceProcessor.ts:162<br>`MediaProcessor.loadImage` src/utils/mediaProcessor.ts:210 |
| 2 | 6 | `snapshot` src/__tests__/generatorExports.test.ts:32<br>`snapshot` src/__tests__/generators.test.ts:49 |

## Look-alikes (not duplicates)

| Copies | Where |
|---|---|
| 2 | `ok` src/__tests__/mcpCoverage.test.ts:36<br>`ok` src/__tests__/mcpReviewFixes.test.ts:21 |

## Files too big to read whole

| File | Lines |
|---|---|
| src/components/features/WelcomeAsciiAnimationData.tsx | 26,994 |
| src/components/common/AsciiMotionLogo.tsx | 8,019 |
| src/utils/exportRenderer.ts | 4,907 |
| src/stores/timelineStore.ts | 4,360 |
| src/hooks/useKeyboardShortcuts.ts | 3,203 |
| src/constants/version.ts | 1,991 |
| src/components/features/MediaImportPanel.tsx | 1,604 |
| src/components/features/InteractiveBezierOverlay.tsx | 1,575 |
| src/stores/bezierStore.ts | 1,440 |
| src/stores/toolStore.ts | 1,407 |
| src/constants/bezierAutofill/blockCharacters.ts | 1,288 |
| src/components/features/ColorPickerOverlay.tsx | 1,260 |
| src/components/features/timeline/TimelineTrackArea.tsx | 1,245 |
| src/types/index.ts | 1,201 |
| src/constants/bezierAutofill/ansiCharacters.ts | 1,178 |
| src/utils/asciiConverter.ts | 1,165 |

## Same name, different code

| Name | Where |
|---|---|
| `makeCell` | src/__tests__/ansiExport.test.ts:10<br>src/__tests__/effectsPipeline.test.ts:27<br>src/__tests__/fontExport.test.ts:55<br>src/__tests__/layerCompositing.test.ts:34<br>src/__tests__/phase5ExportMigration.test.ts:35<br>src/__tests__/phase6Integration.test.ts:34 |
| `run` | src/__tests__/mcpCoverage.test.ts:32<br>src/__tests__/mcpImportExportSettings.test.ts:20<br>src/__tests__/mcpOperations.test.ts:22<br>src/__tests__/mcpReviewFixes.test.ts:17<br>src/mcp/operations/handlers/generators.ts:12 |
| `ok` | src/__tests__/mcpCoverage.test.ts:36<br>src/__tests__/mcpGeneratorCommands.test.ts:70<br>src/__tests__/mcpImportExportSettings.test.ts:22<br>src/__tests__/mcpOperations.test.ts:27<br>src/__tests__/mcpReviewFixes.test.ts:21 |
| `hexToRgb` | src/hooks/usePostEffectsRenderer.ts:29<br>src/utils/colorConversion.ts:8<br>src/utils/gridColor.ts:8<br>src/utils/mediaImportPipeline.ts:237<br>src/utils/webgl/WebGLPostProcessor.ts:532 |
| `replay` | src/__tests__/animatedText.test.tsx:55<br>src/__tests__/generatorHistory.test.tsx:35<br>src/__tests__/paletteEditorDialog.test.tsx:23<br>src/__tests__/particleGenerator.test.tsx:40 |
| `cell` | src/__tests__/canvasStoreLayerSync.test.ts:25<br>src/__tests__/mcpClient.test.ts:59<br>src/__tests__/mcpFrameNavigation.test.ts:11<br>src/__tests__/textToolTextBox.test.ts:15 |
| `resetStore` | src/__tests__/effectBlocks.test.ts:12<br>src/__tests__/layerLimits.test.ts:24<br>src/__tests__/timelineStore.test.ts:17<br>src/__tests__/timelineUI.test.ts:27 |
| `resetStores` | src/__tests__/mcpClient.test.ts:67<br>src/__tests__/mcpFrameNavigation.test.ts:19<br>src/__tests__/phase5ExportMigration.test.ts:24<br>src/__tests__/phase6Integration.test.ts:23 |
| `isRecord` | src/mcp/client.ts:73<br>src/mcp/generatorCommands.ts:66<br>src/mcp/legacyAdapters.ts:21<br>src/mcp/operations/handlers/io.ts:111 |
| `settings` | src/__tests__/animatedText.test.tsx:39<br>src/__tests__/ansiExport.test.ts:98<br>src/__tests__/particleGenerator.test.tsx:29 |
| `makeV1Session` | src/__tests__/mcpClient.test.ts:131<br>src/__tests__/phase5ExportMigration.test.ts:88<br>src/__tests__/sessionMigration.test.ts:20 |
| `makeV2Session` | src/__tests__/mcpClient.test.ts:167<br>src/__tests__/phase5ExportMigration.test.ts:40<br>src/__tests__/sessionMigration.test.ts:52 |
| `toPascalCase` | src/components/features/InkExportDialog.tsx:18<br>src/components/features/OpenTuiExportDialog.tsx:18<br>src/components/features/ReactExportDialog.tsx:17 |
| `rgbToHex` | src/utils/colorConversion.ts:20<br>src/utils/effectsProcessing.ts:532<br>src/utils/gradientEngine.ts:322 |
| `makeBundle` | src/__tests__/ansiExport.test.ts:16<br>src/__tests__/fontExport.test.ts:59 |
| ... 19 more | | |

## Constants retyped as raw values

| Constant | Value | Defined in | Retyped | Files |
|---|---|---|---|---|
| `DEFAULT_TEXT_COLOR` | `"#ffffff"` | src/utils/generators/intensityMapping.ts | 240x | src/__tests__/animatedText.test.tsx, src/__tests__/ansiExport.test.ts, src/__tests__/effectsPipeline.test.ts, ... |
| `TRANSPARENT` | `"transparent"` | src/registry/generators/animatedText.ts | 153x | src/__tests__/animatedText.test.tsx, src/__tests__/ansiExport.test.ts, src/__tests__/canvasStoreLayerSync.test.ts, ... |
| `DEFAULT_FONT_ID` | `"auto"` | src/constants/fonts.ts | 51x | src/__tests__/fontExport.test.ts, src/components/common/AsciiMotionLogo.tsx, src/components/features/CanvasSettings.tsx, ... |
| `DEFAULT_LEGACY_FG` | `"#FFFFFF"` | src/mcp/legacyAdapters.ts | 44x | src/__tests__/animatedText.test.tsx, src/__tests__/canvasStoreLayerSync.test.ts, src/__tests__/layerCompositing.test.ts, ... |
| `ANIMATED_TEXT_GENERATOR_TYPE` | `"animated-text"` | src/registry/generators/animatedText.ts | 26x | src/__tests__/animatedText.test.tsx, src/__tests__/generatorExports.test.ts, src/__tests__/generators.test.ts, ... |
| `SELECTION_CELL_LIMIT` | `2000` | src/mcp/operations/handlers/document.ts | 22x | src/components/features/BubbleteaExportDialog.tsx, src/components/features/ExportCharacterPaletteDialog.tsx, src/components/features/ExportPaletteDialog.tsx, ... |
| `DEFAULT_GENERATOR_CHARACTER_PALETTE_ID` | `"minimal-ascii"` | src/registry/generatorRegistry.ts | 17x | src/__tests__/fontExport.test.ts, src/__tests__/generatorMapping.test.ts, src/__tests__/paletteEditorDialog.test.tsx, ... |
| `BTN_ICON` | `"w-3.5 h-3.5"` | src/components/features/timeline/TimelineToolbar.tsx | 13x | src/components/features/timeline/LayerContextMenu.tsx, src/components/features/timeline/LayerList.tsx, src/components/features/timeline/LayerListItem.tsx, ... |
| `TEXT` | `"Text"` | src/registry/generators/animatedText.ts | 10x | src/__tests__/animatedText.test.tsx, src/components/features/ToolPalette.tsx, src/hooks/useToolBehavior.ts, ... |
| `DEFAULT_PALETTE_ID` | `"block"` | src/constants/bezierAutofill/index.ts | 10x | src/components/common/AsciiMotionLogo.tsx, src/components/features/CanvasGrid.tsx, src/components/features/ColorPickerOverlay.tsx, ... |
| `DEFAULT_ACTIVE_PALETTE_ID` | `"ansi-16"` | src/constants/defaultPalettes.ts | 9x | src/__tests__/ansiExport.test.ts, src/__tests__/paletteEditorDialog.test.tsx, src/constants/defaultPalettes.ts, ... |
| `CHECKERBOARD` | `"linear-gradient(45deg, #ccc 25%, transp` | src/components/features/timeline/GeneratorPropertiesPanel.tsx | 6x | src/components/features/CanvasSettings.tsx, src/components/features/ColorPicker.tsx, src/components/features/ColorPickerOverlay.tsx, ... |
| `DEFAULT_OUTLINE_FONT_ID` | `"jetbrains-mono"` | src/utils/font/fontRegistry.ts | 5x | src/__tests__/fontExport.test.ts, src/__tests__/mcpImportExportSettings.test.ts, src/constants/fonts.ts, ... |
| `STYLE` | `"Style"` | src/registry/generators/animatedText.ts | 3x | src/mcp/contract/operations.ts, src/utils/font/fontRegistry.ts |
| `COMPACT_BREAKPOINT` | `1200` | src/hooks/useLayoutState.ts | 2x | src/components/features/timeline/TimelineRuler.tsx, src/components/features/timeline/TimelineTrackArea.tsx |
| ... 9 more | | |
