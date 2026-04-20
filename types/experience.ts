// ─── Section / Content Types ──────────────────────────────────────────────────

export const SECTION_IDS = [
  "white-glove",
  "storage",
  "designers",
  "households",
  "fine-art",
  "retail-3pl",
  "imports-exports",
  "installation",
  "locations",
  "quote",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface SectionValueProp {
  headline: string;
  body: string;
}

export interface AirSeaSection {
  id: SectionId;
  label: string;
  tagline: string;
  valueProps: [SectionValueProp, SectionValueProp, SectionValueProp];
  accentHex: string;
  videoId?: string; // Mux playback ID, if this section has associated 360 video
  ctaLabel: string;
}

// ─── Video Types ──────────────────────────────────────────────────────────────

export interface MuxVideoSource {
  playbackId: string;
  label: string;
  is360: boolean;
}

// ─── Camera Types ─────────────────────────────────────────────────────────────

export type CameraFocusMode = "overview" | "slate" | "video" | "cta";

// ─── UI Mode ──────────────────────────────────────────────────────────────────

export type SceneUIMode = "normal" | "focused" | "fullscreen-video";

// ─── Interaction ──────────────────────────────────────────────────────────────

export type InteractionEventType = "enter" | "leave" | "down" | "up" | "click";

/**
 * Normalised interaction event — same shape on desktop (pointer) and in future
 * XR (controller / gaze). Any system that registers interactables consumes this
 * interface, keeping the input layer replaceable.
 */
export interface InteractionEvent {
  type: InteractionEventType;
  targetId: string;
  // XR-forward fields — undefined on desktop
  xrInputSource?: unknown;
}

export interface IInteractable {
  id: string;
  onInteraction(event: InteractionEvent): void;
}

// ─── Scene Lifecycle ──────────────────────────────────────────────────────────

export interface SceneDisposable {
  dispose(): void;
}
