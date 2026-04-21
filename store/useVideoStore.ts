import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { AIRSEA_VIDEOS } from "@/content/videos";
import type { AirSeaVideo } from "@/content/videos";

export type VideoSceneMode = "gallery" | "playback";

interface VideoState {
  videos: AirSeaVideo[];
  sceneMode: VideoSceneMode;
  selectedVideoId: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  sceneReady: boolean;
  isTransitioning: boolean;
  xrSupported: boolean;
  xrEnter: (() => Promise<void>) | null;
}

interface VideoActions {
  selectVideo(id: string): void;
  returnToGallery(): void;
  setIsPlaying(v: boolean): void;
  toggleMute(): void;
  setSceneReady(v: boolean): void;
  setIsTransitioning(v: boolean): void;
  setXrSupported(v: boolean): void;
  setXrEnter(fn: (() => Promise<void>) | null): void;
}

type VideoStore = VideoState & VideoActions;

export const useVideoStore = create<VideoStore>()(
  subscribeWithSelector((set) => ({
    videos: AIRSEA_VIDEOS,
    sceneMode: "gallery",
    selectedVideoId: null,
    isPlaying: false,
    isMuted: true,
    sceneReady: false,
    isTransitioning: false,
    xrSupported: false,
    xrEnter: null,

    selectVideo: (id) =>
      set({ selectedVideoId: id, sceneMode: "playback", isTransitioning: true, sceneReady: false }),
    returnToGallery: () =>
      set({ sceneMode: "gallery", selectedVideoId: null, isTransitioning: true, sceneReady: false, isPlaying: false }),

    setIsPlaying: (v) => set({ isPlaying: v }),
    toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
    setSceneReady: (v) => set({ sceneReady: v }),
    setIsTransitioning: (v) => set({ isTransitioning: v }),
    setXrSupported: (v) => set({ xrSupported: v }),
    setXrEnter: (fn) => set({ xrEnter: fn }),
  }))
);

export function selectActiveVideo(state: VideoStore): AirSeaVideo | null {
  if (!state.selectedVideoId) return null;
  return state.videos.find((v) => v.id === state.selectedVideoId) ?? null;
}
