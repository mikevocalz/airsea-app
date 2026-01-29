import * as FileSystem from 'expo-file-system';
import {
  FFmpegKit,
  FFmpegKitConfig,
  FFprobeKit,
  ReturnCode,
} from 'ffmpeg-kit-react-native';

const sanitizePath = (uri: string) => uri.replace('file://', '');

const escapeForConcat = (value: string) => value.replace(/'/g, "'\\''");

const getDurationMs = async (uri: string) => {
  const session = await FFprobeKit.getMediaInformation(sanitizePath(uri));
  const info = session.getMediaInformation();
  const duration = info?.getDuration();
  if (!duration) {
    return 0;
  }
  const parsed = Number.parseFloat(duration);
  return Number.isFinite(parsed) ? parsed * 1000 : 0;
};

export const mergeVideoClips = async (
  videoUris: string[],
  onProgress?: (progress: number) => void
) => {
  if (videoUris.length < 2) {
    throw new Error('At least two videos are required to merge.');
  }

  const durations = await Promise.all(videoUris.map(getDurationMs));
  const totalDurationMs = durations.reduce((total, duration) => total + duration, 0);
  const timestamp = Date.now();
  const listUri = `${FileSystem.cacheDirectory}video-merge-${timestamp}.txt`;
  const outputUri = `${FileSystem.cacheDirectory}video-merged-${timestamp}.mp4`;
  const listContent = videoUris
    .map((uri) => `file '${escapeForConcat(sanitizePath(uri))}'`)
    .join('\n');

  await FileSystem.writeAsStringAsync(listUri, listContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const command = [
    '-f concat',
    '-safe 0',
    `-i "${sanitizePath(listUri)}"`,
    '-c:v libx264',
    '-preset veryfast',
    '-crf 23',
    '-c:a aac',
    '-movflags +faststart',
    `"${sanitizePath(outputUri)}"`,
  ].join(' ');

  try {
    if (totalDurationMs > 0 && onProgress) {
      FFmpegKitConfig.enableStatisticsCallback((stats) => {
        const time = stats.getTime();
        if (time <= 0) {
          onProgress(0);
          return;
        }
        const progress = Math.min(time / totalDurationMs, 1);
        onProgress(progress);
      });
    }
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    if (!ReturnCode.isSuccess(returnCode)) {
      const logs = await session.getAllLogsAsString();
      throw new Error(logs || 'Video merge failed.');
    }
  } finally {
    FFmpegKitConfig.enableStatisticsCallback(undefined);
    await FileSystem.deleteAsync(listUri, { idempotent: true });
  }

  return outputUri;
};
