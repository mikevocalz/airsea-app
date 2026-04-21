import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { SectionId, CameraFocusMode, SceneUIMode } from "@/types/experience";
import { AIRSEA_SECTIONS } from "@/content/airsea";

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AirSeaExperienceState {
  // Content
  activeSection: SectionId;
  activeSlatePage: number; // for future multi-page slates

  // Video
  activeVideoPlaybackId: string | null;
  isPlaying: boolean;
  isMuted: boolean;

  // Interaction
  activeHotspotId: string | null;
  hoveredControlId: string | null;

  // Camera
  cameraFocusMode: CameraFocusMode;
  isTransitioning: boolean;

  // Scene lifecycle
  sceneReady: boolean;
  uiMode: SceneUIMode;

  // XR
  xrSupported: boolean;
  xrActive: boolean;
  xrEnter: (() => Promise<void>) | null;
}

// ─── Actions Shape ────────────────────────────────────────────────────────────

interface AirSeaExperienceActions {
  setActiveSection(id: SectionId): void;
  setActiveSlatePage(page: number): void;

  setActiveVideo(playbackId: string | null): void;
  setIsPlaying(playing: boolean): void;
  setIsMuted(muted: boolean): void;
  toggleMute(): void;

  setActiveHotspot(id: string | null): void;
  setHoveredControl(id: string | null): void;

  setCameraFocusMode(mode: CameraFocusMode): void;
  setIsTransitioning(transitioning: boolean): void;

  setSceneReady(ready: boolean): void;
  setUIMode(mode: SceneUIMode): void;

  setXrSupported(supported: boolean): void;
  setXrActive(active: boolean): void;
  setXrEnter(fn: (() => Promise<void>) | null): void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

type StoreState = AirSeaExperienceState & AirSeaExperienceActions;

export const useAirSeaExperienceStore = create<StoreState>()(
  subscribeWithSelector((set) => ({
    // ── Initial state ────────────────────────────────────────────────────────
    activeSection: AIRSEA_SECTIONS[0].id,
    activeSlatePage: 0,

    activeVideoPlaybackId: null,
    isPlaying: false,
    isMuted: true, // start muted to satisfy autoplay policies

    activeHotspotId: null,
    hoveredControlId: null,

    cameraFocusMode: "overview",
    isTransitioning: false,

    sceneReady: false,
    uiMode: "normal",

    xrSupported: false,
    xrActive: false,
    xrEnter: null,

    // ── Actions ──────────────────────────────────────────────────────────────
    setActiveSection: (id) => set({ activeSection: id, activeSlatePage: 0 }),
    setActiveSlatePage: (page) => set({ activeSlatePage: page }),

    setActiveVideo: (playbackId) => set({ activeVideoPlaybackId: playbackId }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setIsMuted: (muted) => set({ isMuted: muted }),
    toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

    setActiveHotspot: (id) => set({ activeHotspotId: id }),
    setHoveredControl: (id) => set({ hoveredControlId: id }),

    setCameraFocusMode: (mode) => set({ cameraFocusMode: mode }),
    setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),

    setSceneReady: (ready) => set({ sceneReady: ready }),
    setUIMode: (mode) => set({ uiMode: mode }),

    setXrSupported: (supported) => set({ xrSupported: supported }),
    setXrActive: (active) => set({ xrActive: active }),
    setXrEnter: (fn) => set({ xrEnter: fn }),
  }))
);

// ─── Derived selectors ────────────────────────────────────────────────────────

export function selectActiveSection(state: StoreState) {
  return AIRSEA_SECTIONS.find((s) => s.id === state.activeSection)!;
}
