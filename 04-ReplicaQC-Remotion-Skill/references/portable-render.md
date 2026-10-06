# 便携渲染说明

在工程根目录运行：

```powershell
npm ci
npx remotion render src/index.ts <CompositionId> out/video-silent.mp4 --codec=h264 --crf=18 --muted --concurrency=4
```

优先让 Remotion 使用其可用浏览器。若它不能发现浏览器，再设置当前机器的真实路径：

```powershell
$env:BROWSER_EXECUTABLE = "C:\path\to\chrome-or-chromium"
```

脚本应把这个变量作为 `--browser-executable` 传入；不要把某台机器的绝对路径硬编码进 Skill 或源码。若浏览器依赖无法获得，回执应说明环境阻断，不要伪造成片。

纯 Remotion 且允许复用音频时，再执行外部音频分支：

```powershell
ffmpeg -y -i out/video-silent.mp4 -i public/reference-audio.m4a -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -movflags +faststart out/video.mp4
```

如果 composition 已经含有 `<Audio>`，使用 composition audio 分支并直接输出有声文件，绝对不要再执行上面的 mux 分支，否则会重复叠加音频。无论选择哪一支，都用 ffprobe 核验视频/容器/音频时长、codec、采样率和声道。不要把 composition id 留给默认值；不要依赖项目外的历史 bundle 目录；不要用 `-shortest` 截去用户要求保留的音频尾部。

脚本可通过 `BROWSER_EXECUTABLE`、`FFMPEG` 和 `FFPROBE` 环境变量适配本机路径。交付时把实际使用的命令写到工程 README 和专属 handoff 指令里。
