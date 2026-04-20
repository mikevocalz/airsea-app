/**
 * Mux streaming utilities.
 *
 * Mux serves HLS. Safari handles .m3u8 natively; all other browsers need
 * hls.js injected into the video element before Babylon wraps it.
 *
 * This module provides a managed HTMLVideoElement that is HLS-ready across
 * all target browsers. Babylon's VideoTexture accepts an HTMLVideoElement
 * directly, so we hand ownership to Babylon and keep a reference for playback
 * control and clean disposal.
 */

import type Hls from "hls.js";

export function getMuxHlsUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function getMuxThumbnailUrl(playbackId: string, time = 0): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}`;
}

export interface ManagedVideoElement {
  video: HTMLVideoElement;
  /** Call when done — tears down HLS instance and removes the video element. */
  dispose(): void;
}

/**
 * Creates an HTMLVideoElement wired to a Mux HLS stream.
 * - Uses native HLS on Safari.
 * - Injects hls.js on Chrome/Firefox/Edge.
 *
 * The element is attached to the document body but kept invisible; Babylon
 * reads its decoded frames via WebGL. Disposing removes both the hls.js
 * instance and the DOM element.
 */
export async function createMuxVideoElement(
  playbackId: string,
  opts: { muted?: boolean; loop?: boolean; autoplay?: boolean } = {}
): Promise<ManagedVideoElement> {
  const url = getMuxHlsUrl(playbackId);

  const video = document.createElement("video");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.muted = opts.muted ?? true;
  video.loop = opts.loop ?? true;
  video.crossOrigin = "anonymous";
  video.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;";
  document.body.appendChild(video);

  let hlsInstance: Hls | null = null;

  const canPlayNative = video.canPlayType("application/vnd.apple.mpegurl");

  if (canPlayNative) {
    // Safari — native HLS
    video.src = url;
  } else {
    // Chrome / Firefox / Edge — hls.js
    const HlsLib = (await import("hls.js")).default;
    if (HlsLib.isSupported()) {
      hlsInstance = new HlsLib({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      // MSE not available; attempt direct src as last resort
      video.src = url;
    }
  }

  if (opts.autoplay) {
    // Must be user-gesture-gated or muted to succeed on modern browsers
    video.play().catch(() => {
      // Silently deferred until user interaction triggers playback
    });
  }

  return {
    video,
    dispose() {
      video.pause();
      video.src = "";
      video.load();
      hlsInstance?.destroy();
      hlsInstance = null;
      video.remove();
    },
  };
}
