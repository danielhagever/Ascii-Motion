# Cleaning a vibe-coded app, with proof that nothing changed

This branch holds the evidence for a cleanup of [Ascii-Motion](https://github.com/CameronFoxly/Ascii-Motion). The cleanup itself is on the branch [`proofkit-cleanup`](https://github.com/danielhagever/Ascii-Motion/tree/proofkit-cleanup) of this fork ([see the changes](https://github.com/danielhagever/Ascii-Motion/compare/main...proofkit-cleanup)).

This is an independent demonstration. It is not affiliated with the Ascii-Motion project or endorsed by its author, and nothing here is a criticism of the app: it is a real, working, actively developed project, which is exactly why it makes a fair test.

## The app

Ascii-Motion is a web app for making ASCII-art animations. Its README says: "This has been meticulously vibe-coded into existence over the last year or so", by "an animator and brand designer with next to no prior experience with building tools". It has more than 900 stars and its own suite of 817 tests.

The cleanup touched the MIT-licensed app code in `src/`, one line of documentation and one line of test configuration that named removed files. The repository's proprietary folders (`packages/premium/`, `packages/web/`) were left alone.

## What the scan found

| Check | Before | After |
|---|---|---|
| Lines of app code in `src/` | 176,404 | 173,468 |
| Groups of duplicated functions | 14 | 6 |
| Files over 1,000 lines | 18 | 16 |

Examples: `hexToRgb` written three times, `sanitizeFileName` in four export dialogs, a byte-identical copy of one file under another name, an old copy of the main animation store that nothing imported, and four `_backup` / `_new` leftovers.

The two scan reports are in [`scan-before.md`](scan-before.md) and [`scan-after.md`](scan-after.md).

Both scan reports were made again on 12 November 2026, after the scan's counting was made stricter. The earlier versions are in this branch's history. Two things changed. Findings that exist only in test files are now counted apart from the app's own code, so the 14 groups above read as 11 in app code and 3 in test files, and the 6 as 3 and 3. Common words, round numbers and plain black or white are no longer counted as retyped constants, because most of those matches were coincidences. That stricter rule also misses some real ones, among them the four `'auto'` font ids replaced in step 4 below. Those four are in the proof report.

## What the cleanup did

Five commits, 28 files, 2,937 fewer lines.

1. Removed four leftover files that nothing imported.
2. Kept one copy of each duplicated helper (`hexToRgb`, `sanitizeFileName`, `finalizeFileName`, `deriveCanvasBounds`, `MenuItem`, `MenuSeparator`) and removed two dead duplicate files.
3. Split two oversized files by moving whole pieces: the session importer (1,239 lines into 782 + 463) and the ASCII converter (1,839 into 1,164 + 232 + 449).
4. Replaced four places that retyped the default font id with the existing constant.
5. Removed the line in `vitest.config.ts` that still listed one of the removed files for coverage. This commit was added later: see the correction below.

## The proof

| Proof | Result |
|---|---|
| Code: every function, method, constant, class and top-level statement matched before and after | 2,348 of 2,348 proven: 2,261 unchanged, 52 moved, 11 merged duplicates, 20 dead, 4 using a constant in place of its value. Nothing in `src/` is left for review. One change outside `src/` is listed for a person to read: the line removed from `vitest.config.ts` |
| Tests: the project's own suite on both versions | 817 passed on both; no test file was changed |
| Screens: both builds driven through the same 16 screens in a headless browser, twice each | 16 of 16 the same: pixels identical, and the same text, page title and address, browser errors, network requests and saved data. The built stylesheet is the same file, byte for byte |
| Outputs: the functions the cleanup touched, called with the same inputs on both versions | 594 of 594 results identical |

The project's own type check passes on both versions, and its lint reports the same three existing problems before and after.

"Proven" means two things for each piece of code: it reads the same once formatting, comments and type annotations are set aside, and every outside name it uses still leads to the same thing. The second part matters here. Eleven places in this app define a `hexToRgb`, seven of them at the top level of a file, and they are not all alike. Merging three identical ones is only safe if every caller ends up at one of those three.

One value was set aside in the screen proof, and the report names it: the welcome dialog saves the time it was dismissed, which differs on every run of either build.

The full report, with every item, is [`PROOF.md`](PROOF.md). Screenshots of each screen are in [`screens/before/`](screens/before) and [`screens/after/`](screens/after). The steps that were driven and the calls that were recorded are in [`checks/`](checks).

## Checking the proof itself

A proof that says "all the same" is only worth something if it would have said otherwise. Bugs were planted on throwaway copies of the cleanup:

| Planted | Caught by |
|---|---|
| `>` changed to `>=` inside a moved function | the code proof, which printed the old and the new code |
| an import switched to a different `hexToRgb` | the code proof, which named both: the one in `gradientEngine.ts` before, the one in `gridColor.ts` after |
| `.toLowerCase()` removed from the merged file-name function | the code proof, and the screen proof: the four export dialogs that use the function showed `My-Demo-File-_v2` where the old build shows `my-demo-file-_v2`. The other three export dialogs, which do not use it, stayed identical. The app's own 817 tests did not notice, which is why there is more than one proof |
| two small changes inside merged helpers | the output proof: 3 of the 594 results changed |

The code proof was also tested by machine. The cleaned code was broken on purpose in 230 small ways of 26 kinds (a flipped comparison, a deleted statement, a swapped argument, an import pointed elsewhere), one at a time, and the code proof noticed all 230. The opposite check passed too: every file was reprinted, stripped of comments, switched to other quotes and to Windows line endings, and nothing was flagged.

## A correction, 10 November 2026

The first version of this page said nothing was left for review. That was what the tool reported, and it was incomplete in two ways, both found while preparing a pull request from this cleanup.

- The cleanup deleted `src/stores/animationStoreAdapter.ts`, and `vitest.config.ts` still listed that file for coverage. Nothing breaks because of it, but it is a loose end the proof should have pointed at. The code proof looked at imports only. It now also looks for a deleted file's path written anywhere in what remains (a config list, a `package.json` script, a CI workflow), and the fifth commit removes the line.
- Tailwind reads every file under `src/`, including the six deleted ones, so a class that only a deleted file mentioned would disappear from the stylesheet without any visited screen changing. Here the stylesheet turned out identical, but the screen proof had not checked. It now compares the built stylesheets of both versions.

The four proofs above were run again on the five commits with the corrected tool, and the numbers on this page are from that run.

## What was left alone, and why

- `exportRenderer.ts` (4,906 lines) is one class. Splitting a class changes how it is called, which is a design decision for the owner, not something to prove after the fact.
- Functions duplicated between a module and a class method. Merging them changes call sites.
- Duplicated helpers inside test files.

## How the code was run safely

The tests and the build run the project's code and all of its packages. Before installing anything: every one of the 1,018 entries in the lockfile was confirmed to come from the official npm registry with a sha512 hash, all 975 distinct versions were looked up in the OSV.dev vulnerability and malware database (no malware advisories), the project was checked for npm settings that redirect an install (none), and the config files that run at test and build time were read. Packages were installed with install scripts switched off. Tests and builds ran in a sandbox with no internet, no view of the home folder outside the project, an empty environment, and the project's git folder locked. The browser that drove the screens was offline too.

## Limits

The code proof follows names through imports and exports. It cannot follow `obj[name]` or reflection, and it does not prove the order in which modules load; anything of that kind that changes is listed for review (here: nothing). Screens and tests prove what they exercise: here, the editor, seven export dialogs, both right-click menus and five tools.

The tool that produced the report is called proofkit. It works on JavaScript and TypeScript, and it is not public.

Made by [danielhagever](https://github.com/danielhagever).
