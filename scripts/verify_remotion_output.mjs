#!/usr/bin/env node
import {writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const raw = process.argv.slice(2);
const options = {};
const positional = [];
for (let i = 0; i < raw.length; i += 1) {
  const item = raw[i];
  if (item.startsWith('--')) {
    const key = item.slice(2);
    const next = raw[i + 1];
    if (next && !next.startsWith('--')) { options[key] = next; i += 1; }
    else options[key] = true;
  } else positional.push(item);
}
const file = options.file || positional[0];
const expected = {
  width: Number(options.width ?? positional[1]),
  height: Number(options.height ?? positional[2]),
  fps: String(options.fps ?? positional[3]),
  frames: Number(options.frames ?? positional[4]),
  audio: String(options.audio ?? positional[5] ?? 'true') !== 'false',
  videoDuration: options['video-duration'] == null ? undefined : Number(options['video-duration']),
  audioDuration: options['audio-duration'] == null ? undefined : Number(options['audio-duration']),
  containerDuration: options['container-duration'] == null ? undefined : Number(options['container-duration']),
  audioCodec: options['audio-codec'],
  sampleRate: options['sample-rate'] == null ? undefined : String(options['sample-rate']),
  channels: options.channels == null ? undefined : Number(options.channels),
  tolerance: options.tolerance == null ? 0.05 : Number(options.tolerance),
};
if (!file || !Number.isFinite(expected.width) || !Number.isFinite(expected.height) || !expected.fps || !Number.isFinite(expected.frames)) {
  console.error('Usage: node verify_remotion_output.mjs <file> <width> <height> <fps> <frames> [audio] [--video-duration seconds --audio-duration seconds --container-duration seconds --audio-codec aac --sample-rate 48000 --channels 2]');
  process.exit(2);
}
const ffprobe = process.env.FFPROBE || 'ffprobe';
const r = spawnSync(ffprobe, ['-v','error','-count_frames','-show_streams','-show_format','-of','json',file], {encoding:'utf8', windowsHide:true, shell:false});
if (r.error) throw r.error;
if (r.status !== 0) { console.error(r.stderr); process.exit(r.status || 1); }
const probe = JSON.parse(r.stdout);
const video = probe.streams?.find((s) => s.codec_type === 'video');
const audio = probe.streams?.find((s) => s.codec_type === 'audio');
const ratio = (value) => { const [a,b] = String(value ?? '').split('/').map(Number); return Number.isFinite(a) && Number.isFinite(b) && b ? a / b : Number(value); };
const close = (a,b,t=expected.tolerance) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a-b) <= t;
const actual = {
  width: video?.width,
  height: video?.height,
  fps: video?.avg_frame_rate || video?.r_frame_rate,
  fpsNumeric: ratio(video?.avg_frame_rate || video?.r_frame_rate),
  frames: Number(video?.nb_read_frames),
  videoDuration: Number(video?.duration),
  audio: Boolean(audio),
  audioCodec: audio?.codec_name,
  sampleRate: audio?.sample_rate,
  channels: audio?.channels,
  audioDuration: Number(audio?.duration),
  containerDuration: Number(probe.format?.duration),
};
const expectedFpsNumeric = ratio(expected.fps);
const checks = {
  width: actual.width === expected.width,
  height: actual.height === expected.height,
  fps: close(actual.fpsNumeric, expectedFpsNumeric, 0.002),
  frames: actual.frames === expected.frames,
  audio: actual.audio === expected.audio,
  videoDuration: expected.videoDuration == null || close(actual.videoDuration, expected.videoDuration),
  audioDuration: expected.audioDuration == null || close(actual.audioDuration, expected.audioDuration),
  containerDuration: expected.containerDuration == null || close(actual.containerDuration, expected.containerDuration),
  audioCodec: expected.audioCodec == null || actual.audioCodec === expected.audioCodec,
  sampleRate: expected.sampleRate == null || actual.sampleRate === expected.sampleRate,
  channels: expected.channels == null || actual.channels === expected.channels,
};
const result = {pass: Object.values(checks).every(Boolean), file, expected, actual, checks};
const jsonPath = process.env.VERIFICATION_JSON || options.json;
if (jsonPath) writeFileSync(jsonPath, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exit(1);
