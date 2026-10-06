# ReplicaQC 方法沉淀

## 这个方法解决什么问题

目标不是把参考 MP4 放进 Remotion 再输出，而是把参考视频拆成时间轴、图层、几何、文字、颜色和运动规则，再用可编辑代码生成同样的画面。`ReplicaQC` 前半段的生产组合叫 `Replica`，由 `src/replica.tsx` 负责画面，`src/root.tsx` 只注册该组合；它只带 `public/reference-audio.m4a`，没有视觉参考素材。

## 代码结构

- `src/index.ts`：`registerRoot(...)` 入口。
- `src/root.tsx`：明确注册 composition id、宽高、fps、帧数；前半段包只注册 `Replica`。
- `src/<composition>.tsx`：按图层组织背景、卡片、文字、SVG 场景和转场。
- `src/*.json`：把重复使用的关键帧、坐标、颜色或几何参数从 JSX 中抽出来。
- `public/`：只放用户允许复用的音频或明确批准的视觉素材。
- `scripts/render-*.mjs`：明确写出 composition id、输出位置和音频处理，不依赖历史绝对路径。

## 时间驱动的动画

使用 `useCurrentFrame()` 作为唯一时间源。将“在第几帧出现、移动、淡出、变色”写成明确的关键帧，再使用 `interpolate()` 与合适的 easing；对开放端使用 `extrapolateLeft: 'clamp'` / `extrapolateRight: 'clamp'`。不要用 CSS transition、CSS animation、`Date.now()` 或真实时间驱动视频。

建议先定义少量语义辅助函数，例如 `ease(frame, start, end)`、`valueAt(frame, keys)` 和 `mix(a, b, t)`，再把这些值写进 SVG 属性、style、opacity、transform、filter 和文字布局。这样智能体能在复刻后快速修改单个时间段，而不是重写整段 JSX。

## 图层复刻顺序

按从后到前处理：

1. 画布背景和大面积渐变；
2. 主卡片、面板、圆角和边框；
3. 次级装饰、图标和光效；
4. 主标题、副标题、按钮和标记；
5. 光晕、模糊、遮罩和转场；
6. 音频流。

每个关键时间点应能回答“哪一层遮住了哪一层、元素的边界在哪里、运动是线性还是缓入缓出”。如果某个元素在参考中是矢量或界面形状，优先用 SVG/CSS 几何重建；不要为了省事把整帧截图当背景。

## 音频与素材边界

纯 Remotion 的默认策略是只复用音频。渲染时先生成静音视频，再用 FFmpeg 复制音频流：

```text
ffmpeg -y -i video-silent.mp4 -i public/reference-audio.m4a -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -movflags +faststart output.mp4
```

不加 `-shortest`，除非用户明确要求按较短的视频流截断。若用户明确允许视觉素材复用，只使用列入素材清单的局部文件和时间段，并在回执中说明；不要默认复用整条参考片。

## 为什么 `ReplicaQC` 适合作为模板

它把 1920×1080、30fps、310 帧注册成可编辑的单一 `Replica`，把画面规则集中在一个可读的 React/SVG 组合里，音频独立处理，渲染后可用 ffprobe 验证 310 帧和音频尾部。它的文字和画面内容只属于那个具体视频；通用 Skill 只继承工程形状和质检方法，不继承具体内容。
