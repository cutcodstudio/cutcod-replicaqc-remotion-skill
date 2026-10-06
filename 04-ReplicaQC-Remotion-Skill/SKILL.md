---
name: replicaqc-remotion-replication
description: Recreate a supplied reference video as an editable, renderable, and measurable Remotion project using frame-driven React/SVG/CSS, optional audio reuse, and iterative visual QC.
---

# ReplicaQC Remotion Replication

Use this skill when the user wants a reference video rebuilt as a Remotion source project that can be edited and rendered again. The reference video is an analysis and QC input; it is not automatically a production visual asset.

This skill distills the method used by the `ReplicaQC` front-half composition: a registered Remotion composition, frame-driven React/SVG/CSS, parameterized timing and geometry, optional audio-only reuse, portable rendering, and evidence-based QC. It generalizes the method; do not copy the example video's text, timing, or content into a new task unless the user asks for that.

## Feasibility gate

Before promising a result, classify the reference:

- **UI / vector / typography / motion graphics:** pure Remotion is usually a good fit. Rebuild visible pixels with React/SVG/CSS.
- **Photographic or live-action footage:** pure Remotion can reproduce timing, composition, typography, and a stylized approximation, but cannot promise pixel-level visual identity without approved visual assets or a different rendering method. Ask whether the user permits specific visual reuse or accepts an approximation.
- **Mixed video:** split the timeline into procedural and approved-asset segments, then document the policy per segment.

If the user requires strict 1:1 and does not permit visual reuse for a photographic segment, state the limitation before implementation. Never silently turn “any video” into an unconditional 1:1 promise.

## Scope and source policy

1. Establish the user's visual-source policy before coding:
   - **Pure Remotion (default):** generate all visible pixels procedurally with React/SVG/CSS. You may reuse extracted audio when the user allows it. Do not import the reference video, screenshots, frame sequences, or reference images into the composition.
   - **Approved visual reuse:** only reuse a specific image/video asset after the user explicitly allows visual reuse. Record every reused asset and its time range in the project README and QC report.
2. The supplied reference video may be decoded for analysis, frame extraction, timing, and comparison. Do not silently bundle it in the deliverable.
3. Never put API keys, bearer tokens, base64 request bodies, or machine-specific secrets in the project. Gemini or another vision model is optional for analysis/review, never a rendering dependency unless the user explicitly asks for it.
4. Do not claim “1:1” from a successful render alone. State the measured technical match, visual score, remaining differences, and unverified items.

## Required workflow

1. **Inspect and lock the contract.** Use `ffprobe` on the reference to record width, height, fps, frame count, video duration, audio codec, sample rate, channels, and audio duration. Decide the composition id, output path, and whether audio is reused. If a reference is absent, explain that visual fidelity cannot be assessed and work from the user's description only.
2. **Build a timeline map.** Identify scene/beat changes and choose representative checkpoints, including the opening, every major transition, the last scene, and any fast motion. Record frame numbers and observable properties: layout, occlusion, text, color, geometry, easing, and audio events. Save `timeline.json` or `timeline.md` in the project.
3. **Create a real Remotion composition.** Register one explicit composition in `src/index.ts`/`src/root.tsx` with the reference dimensions, fps, and frame count. Put the visual implementation in focused components. Drive every change from `useCurrentFrame()` and `interpolate()` (with clamped ranges and deliberate easing); do not rely on CSS `transition`, CSS `animation`, or wall-clock time. Keep editable text, colors, keyframes, and geometry in source or small data files.
4. **Rebuild in layers.** Implement the background, primary geometry, secondary elements, typography, overlays, and transitions in the same layer order as the reference. Use deterministic SVG paths, gradients, masks, filters, transforms, and text metrics. For repeated items, use a data array only when they are intentionally one controlled template. Prefer explicit JSX nodes for independently editable scenes.
5. **Handle audio with one of two branches.** Choose exactly one and record it in the README:
   - **Composition audio:** render the `<Audio>` element in the composition and do not mux that same file afterward.
   - **External stream copy:** render a muted video, then use FFmpeg with `-map 0:v:0 -map 1:a:0 -c:v copy -c:a copy`; do not use `-shortest` when the source audio has a meaningful tail. Check the audio start, duration, codec, sample rate, channels, and container duration.
6. **Make rendering portable.** Include `package.json`, `package-lock.json`, `tsconfig.json`, the complete source, required public assets, a README, and a dedicated render command that names the composition explicitly. Do not depend on a hard-coded absolute Chrome path or a history-specific output directory. See [portable-render.md](references/portable-render.md).
7. **Run technical checks.** Run `npm run check` when available, otherwise `npx tsc --noEmit`, and save the result. Render all frames, then run `ffprobe` and check dimensions, fps, frame count, video duration, container duration, audio stream, codec, sample rate, channels, and expected audio length. The helper `scripts/verify_remotion_output.mjs` accepts explicit expectations for these fields.
8. **Run visual QC and iterate.** Extract reference and candidate checkpoint frames or contact sheets into a temporary/evidence folder. Compare the rendered output to the reference at the timeline checkpoints. Use the dimensions in [qc-protocol.md](references/qc-protocol.md): layout/occlusion, motion/timing, typography/color/detail, and audio alignment. Save each round as `qc-round-01.json`, `qc-round-02.json`, etc., plus `change-log.md`. Fix the largest repeated error first, render again, and keep a short change log. Stop when the user's threshold is met or when another iteration no longer produces a material gain; report the reason.
9. **Deliver a clean source folder.** Keep source, lockfile, public assets, render/verify scripts, timeline map, and QC report. Exclude `node_modules`, `out`, temporary frame dumps, reference video files, raw model requests, and secrets unless the user explicitly asks for them. Put a one-paragraph, self-contained handoff instruction in the project folder.

## ReplicaQC pattern to preserve

The reference implementation's reusable shape is documented in [replica-method.md](references/replica-method.md). The important pattern is the separation between a pure procedural `Replica` composition and any continuation/material experiment: a front-half project should register only the requested composition, contain only the assets that composition needs, and keep its render command unambiguous.

## Completion report

Return only the useful evidence: the project folder, render command, generated MP4 path, TypeScript/ffprobe/verification paths, visual QC JSON paths, measured score or checkpoint findings, and unresolved limitations. Say explicitly whether any visual assets were reused and whether the original reference video was excluded from the deliverable.
