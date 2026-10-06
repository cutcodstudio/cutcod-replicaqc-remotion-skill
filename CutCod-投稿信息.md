# CutCod 投稿信息｜ReplicaQC Remotion 复现规范

- 分组：视频 Skill
- 分类：其他
- 预览视频：`preview.mp4`（工作流概览）
- Skill 附件：`SKILL.md`、`references/`、`scripts/`、`agents/` 和 `通用调用指令.txt`

## 推荐简介

这是一套面向 UI、矢量动效和产品宣传片的 Remotion 复现与质检规范。它把媒体基线、时间线、组件注册、渲染、ffprobe 技术核验和逐帧视觉检查串成可复用流程，适合作为视频源代码项目的配套 Skill。

## 可直接复制的内容

```text
使用 ReplicaQC Remotion 规范复刻参考视频：先用 ffprobe 建立媒体基线并写 timeline，UI/动效优先 React/SVG/CSS 纯 Remotion，明确音频策略，执行 npm ci、tsc、渲染、ffprobe、逐帧 QC；保留 README、timeline、QC 报告及可复现命令，不把参考视频作为视觉资产，未经证据不要声称 1:1。
```

## 使用提示

这是工作流和校验资料，预览视频用于展示“渲染、核验、质检”的使用场景，不代表某一具体成片，也不是通用的“视频提示词”。发布前请把它与实际的可编辑视频工程绑定，并确认其中引用的工具版本和外部资源权限。
