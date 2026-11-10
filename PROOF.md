# Proof report

Cleanup from commit `0a54d3edce` to commit `cf7c142699`. Written by proofkit 0.1.0 (commit 2857865cd8) on 2026-11-10.

| Proof | Result | In short |
|---|---|---|
| Code | **needs review** | 2,348 items proven, 1 to review |
| Tests | passed | 817 passed after, 817 before |
| Screens | passed | 16 of 16 steps the same |
| Outputs | passed | 594 of 594 recorded results identical |

**Something needs review: see the sections below.**

What this shows: the cleanup moved, merged and deleted code without changing what the code does, as far as each check below reaches. The commands that produced each result are at the end.

## Code proof: `0a54d3edce` to `cf7c142699`

Checked folders: src. 510 files and 176,404 lines before, 510 files and 173,468 lines after (-2,936).

Each function, method, constant and class is matched before and after. "Identical" means the same code once formatting, comments and type annotations are set aside, and every outside name in it still refers to the same thing.

| Every declaration | Count | Meaning |
|---|---|---|
| Unchanged | 2,261 | same place, identical |
| Moved | 52 | another file or out of a class, identical |
| Merged duplicates | 11 | the removed copy was identical to the one kept, and its users now reach that one |
| Renamed | 0 | identical under a new name, every user updated |
| Constant used for its value, or renamed callee | 4 (0 new constants) | identical once each name is read as what it stands for |
| Dead code removed | 20 | nothing that still runs referred to it |
| **Needs review: changed** | **0** | the code differs |
| **Needs review: a name changed meaning** | **0** | same text, but a name in it now refers to something else |
| **Needs review: new** | **0** | new declarations |
| **Needs review: removed while used** | **0** | |
| **Needs review: removed, but reachable from outside** | **0** | exports of a published package, or files a framework loads by path |
| **Needs review: copies with their own state merged** | **0** | |
| **Needs review: load-time code** | **0** | top-level statements removed, added, moved or reordered |
| **Needs review: files this proof does not read** | **1** | changed files that are not source code in the checked folders |
| **Needs review: tool comments** | **0** | comments that the compiler, bundler or test runner acts on |
| Test code changed (information) | 0 | changes inside test files |
| Documentation changed (information) | 1 | docs/CANVAS_TEXT_RENDERING.md |

**2,348 items proven by the code check; 1 need review or a test/screen proof (listed below).**

### Files this proof does not read

| File | Change | Why |
|---|---|---|
| vitest.config.ts | M | outside the checked folders |

### Merged duplicates

| Removed | Kept |
|---|---|
| `sanitizeFileName` src/components/features/InkExportDialog.tsx:17 | `sanitizeFileName in src/utils/exportFileName.ts` |
| `sanitizeFileName` src/components/features/OpenTuiExportDialog.tsx:17 | `sanitizeFileName in src/utils/exportFileName.ts` |
| `sanitizeFileName` src/components/features/ReactExportDialog.tsx:16 | `sanitizeFileName in src/utils/exportFileName.ts` |
| `finalizeFileName` src/components/features/InkExportDialog.tsx:27 | `finalizeFileName in src/utils/exportFileName.ts` |
| `finalizeFileName` src/components/features/OpenTuiExportDialog.tsx:27 | `finalizeFileName in src/utils/exportFileName.ts` |
| `finalizeFileName` src/components/features/ReactExportDialog.tsx:26 | `finalizeFileName in src/utils/exportFileName.ts` |
| `MenuItem` src/components/features/timeline/TimelineContextMenu.tsx:82 | `MenuItem in src/components/features/timeline/ContextMenuItem.tsx` |
| `MenuSeparator` src/components/features/timeline/TimelineContextMenu.tsx:109 | `MenuSeparator in src/components/features/timeline/ContextMenuItem.tsx` |
| `hexToRgb` src/utils/effectsProcessing.ts:535 | `hexToRgb in src/utils/colorConversion.ts` |
| `hexToRgb` src/utils/gradientEngine.ts:324 | `hexToRgb in src/utils/colorConversion.ts` |
| `deriveCanvasBounds` src/registry/effects/wiggle.ts:180 | `deriveCanvasBounds in src/registry/effects/canvasBounds.ts` |

### Dead code removed

| Name | File | Why |
|---|---|---|
| `ColorPicker` | src/components/features/ColorPicker_new.tsx:22 | file was never imported |
| `DashedRectangleIcon` | src/components/features/ToolPalette_backup.tsx:28 | file was never imported |
| `DashedRectangleIcon` | src/components/features/ToolPalette_new.tsx:28 | file was never imported |
| `DRAWING_TOOLS` | src/components/features/ToolPalette_backup.tsx:48 | file was never imported |
| `DRAWING_TOOLS` | src/components/features/ToolPalette_new.tsx:48 | file was never imported |
| `SELECTION_TOOLS` | src/components/features/ToolPalette_backup.tsx:57 | file was never imported |
| `SELECTION_TOOLS` | src/components/features/ToolPalette_new.tsx:57 | file was never imported |
| `UTILITY_TOOLS` | src/components/features/ToolPalette_backup.tsx:64 | file was never imported |
| `UTILITY_TOOLS` | src/components/features/ToolPalette_new.tsx:64 | file was never imported |
| `ToolPalette` | src/components/features/ToolPalette_backup.tsx:68 | file was never imported |
| `ToolPalette` | src/components/features/ToolPalette_new.tsx:68 | file was never imported |
| `ANSI_CHARACTERS_PALETTE` | src/constants/bezierAutofill/ansiCharacters_backup.ts:18 | file was never imported |
| `getActiveLayer` | src/stores/animationStoreAdapter.ts:27 | file was never imported |
| `contentFrameToLegacyFrame` | src/stores/animationStoreAdapter.ts:37 | file was never imported |
| `deriveLegacyFrames` | src/stores/animationStoreAdapter.ts:48 | file was never imported |
| `useAnimationStore` | src/stores/animationStoreAdapter.ts:160 | file was never imported |
| `setupTextRendering` | src/utils/canvasDPI.ts:46 | file was never imported |
| `pixelAlign` | src/utils/canvasDPI.ts:86 | file was never imported |
| `getOptimalFontSize` | src/utils/canvasDPI.ts:94 | file was never imported |
| `(load-time statement)` | src/stores/animationStoreAdapter.ts:633 | file was never imported |

## Test proof: `~/proofkit/tools/jail.sh ~/proofkit-demo/Ascii-Motion node_modules/.bin/vitest run`

| Commit | Exit code | Result | Time |
|---|---|---|---|
| before `0a54d3edce` | 0 | 817 passed, 14 skipped | 4.6s |
| after `cf7c142699` | 0 | 817 passed, 14 skipped | 4.5s |

**All green on both commits.**

No test file differs between the two commits, so both sides ran the same tests.

## Screen proof: `0a54d3edce` to `cf7c142699`

| Step | Result | Text, title, address | Browser errors | Requests sent | Saved data | Pixels | Verdict |
|---|---|---|---|---|---|---|---|
| welcome | same | same | same | same | same | identical | same |
| editor | same | same | same | same | same (1 set aside) | identical | same |
| export-react | same | same | same | same | same (1 set aside) | identical | same |
| export-ink | same | same | same | same | same (1 set aside) | identical | same |
| export-opentui | same | same | same | same | same (1 set aside) | identical | same |
| export-ansi | same | same | same | same | same (1 set aside) | identical | same |
| export-bubbletea | same | same | same | same | same (1 set aside) | identical | same |
| export-image | same | same | same | same | same (1 set aside) | identical | same |
| export-json | same | same | same | same | same (1 set aside) | identical | same |
| layer-menu | same | same | same | same | same (1 set aside) | identical | same |
| frame-menu | same | same | same | same | same (1 set aside) | identical | same |
| tool-gradient | same | same | same | same | same (1 set aside) | identical | same |
| tool-text | same | same | same | same | same (1 set aside) | identical | same |
| tool-rectangle | same | same | same | same | same (1 set aside) | identical | same |
| tool-ascii-type | same | same | same | same | same (1 set aside) | identical | same |
| tool-eyedropper | same | same | same | same | same (1 set aside) | identical | same |

**16 of 16 steps the same, 0 to review, 0 not deterministic.**

Browser errors: 30 before, 30 after, compared step by step. The errors after: `log: Failed to load resource: the server responded with a status of 404 (Not Found) /_vercel/insights/script.js`, `log: Failed to load resource: the server responded with a status of 404 (Not Found) /_vercel/speed-insights/script.js`. Requests during page load: same.

Built stylesheets: 1, the same bytes in both builds.

"Requests sent" is every network request the page started during the step: method, address and a fingerprint of the body. A script or stylesheet that the bundler renamed because its content changed counts as the same file. "Saved data" is what the page left in the browser: local storage, session storage, the cookies a page can read, and IndexedDB (per store, the number of records and a fingerprint of their content), compared value by value. The Cache API and cookies only the server can read are not looked at. Screenshots show the visible window unless the steps file sets `fullPage`.

Set aside, because both builds give a different value on every run of their own: `local › ascii-motion-welcome-state › dismissedAt`.

Pixels are compared exactly. With noise runs, a step also counts as the same within 2x the smaller run-to-run difference of the two builds.

Screenshots: `screens/before/` and `screens/after/` next to this report.

## Output proof: `probe.test.ts`

The same probe ran on both commits (`~/proofkit/tools/jail.sh ~/proofkit-demo/Ascii-Motion node_modules/.bin/vitest run src/__proofkit__/probe.test.ts`) and recorded 594 results: function calls with fixed inputs.

**All 594 results are identical on both commits.**

## How each check was run

The exact commands, as a record. On request they are run again live, on a call.

```bash
proofkit prove-code ~/proofkit-demo/Ascii-Motion --base 0a54d3e --head proofkit-cleanup --include src --out ~/proofkit-demo/proof
proofkit prove-tests ~/proofkit-demo/Ascii-Motion --base 0a54d3e --head proofkit-cleanup --cmd '~/proofkit/tools/jail.sh ~/proofkit-demo/Ascii-Motion node_modules/.bin/vitest run' --node-modules ~/proofkit-demo/Ascii-Motion/node_modules --out ~/proofkit-demo/proof
proofkit prove-screens ~/proofkit-demo/Ascii-Motion --base 0a54d3e --head proofkit-cleanup --build '~/proofkit/tools/jail.sh ~/proofkit-demo/Ascii-Motion node_modules/.bin/vite build' --dist dist --steps ~/proofkit-demo/steps.json --node-modules ~/proofkit-demo/Ascii-Motion/node_modules --noise --out ~/proofkit-demo/proof
proofkit prove-outputs ~/proofkit-demo/Ascii-Motion --base 0a54d3e --head proofkit-cleanup --probe ~/proofkit-demo/checks/probe.test.ts --at src/__proofkit__/probe.test.ts --cmd '~/proofkit/tools/jail.sh ~/proofkit-demo/Ascii-Motion node_modules/.bin/vitest run src/__proofkit__/probe.test.ts' --node-modules ~/proofkit-demo/Ascii-Motion/node_modules --out ~/proofkit-demo/proof
proofkit report
```

## Limits

- The code check follows names through imports and exports. It cannot follow `obj[name]`, reflection or string-built calls, and it does not know which method `obj.method()` reaches, so removed class members are checked by name only.
- "Dead code" means nothing in this repository referred to it. Code that other projects import from this one is outside its view.
- The order in which modules load is not proven in general. What can be seen is listed for review: load-time code that moved or changed order, new import circles, imports of code-running modules that changed places, and constants read before the line that defines them.
- Type declarations are not compared: they do not exist when the program runs. (In classes that use decorators, parameter and field types are compared, because frameworks read them.)
- Tests and screens prove behaviour only for what they exercise. Anything listed under "Needs review" is shown in full so a reviewer can confirm it.
