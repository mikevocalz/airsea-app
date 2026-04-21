"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useVideoStore, selectActiveVideo } from "@/store/useVideoStore";
import { LOGO, BRAND } from "@/lib/brand/tokens";

const SceneCanvas360 = dynamic(
  () => import("@/components/babylon/SceneCanvas360"),
  { ssr: false }
);

const navText: React.CSSProperties = {
  color: BRAND.teal,
  fontSize: "10px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  fontFamily: "Helvetica Neue, Arial, sans-serif",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  transition: "color 0.2s",
  pointerEvents: "auto",
};

const dimText: React.CSSProperties = {
  color: BRAND.textDim,
  fontSize: "10px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  fontFamily: "Helvetica Neue, Arial, sans-serif",
};

export default function Experience360Page() {
  const sceneMode       = useVideoStore((s) => s.sceneMode);
  const sceneReady      = useVideoStore((s) => s.sceneReady);
  const isTransitioning = useVideoStore((s) => s.isTransitioning);
  const isPlaying       = useVideoStore((s) => s.isPlaying);
  const isMuted         = useVideoStore((s) => s.isMuted);
  const xrSupported     = useVideoStore((s) => s.xrSupported);
  const xrEnter         = useVideoStore((s) => s.xrEnter);
  const activeVideo     = useVideoStore(selectActiveVideo);

  const returnToGallery = useVideoStore((s) => s.returnToGallery);
  const setIsPlaying    = useVideoStore((s) => s.setIsPlaying);
  const toggleMute      = useVideoStore((s) => s.toggleMute);

  const hudVisible: React.CSSProperties = {
    opacity: sceneReady ? 1 : 0,
    transition: "opacity 1.4s ease",
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* ── Canvas ──────────────────────────────────────────────────────────── */}
      <SceneCanvas360 />

      {/* ── Transition overlay (covers canvas during scene switch) ──────────── */}
      <div
        className="absolute inset-0 z-50"
        style={{
          background: "#000",
          opacity: isTransitioning ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: "none",
        }}
      />

      {/* ── Top-left: logo ────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 z-10 p-6"
        style={{
          ...hudVisible,
          background: "linear-gradient(135deg, rgba(0,0,0,0.72) 0%, transparent 80%)",
          pointerEvents: "none",
        }}
      >
        <Link href="/" aria-label="AirSea Packing — Home" style={{ pointerEvents: "auto" }}>
          <Image
            src={LOGO.src}
            alt="AirSea Packing"
            width={110}
            height={Math.round(110 / LOGO.aspectRatio)}
            priority
            style={{ filter: "brightness(0) invert(1)", opacity: 0.85 }}
          />
        </Link>
      </div>

      {/* ── Top-right: contextual nav ─────────────────────────────────────── */}
      <div
        className="absolute top-0 right-0 z-10 flex items-center gap-6 px-7 py-6"
        style={{
          ...hudVisible,
          background: "linear-gradient(225deg, rgba(0,0,0,0.6) 0%, transparent 80%)",
          pointerEvents: "none",
        }}
      >
        {xrSupported && sceneMode === "playback" && (
          <button
            style={navText}
            onClick={() => xrEnter?.()}
          >
            Enter XR
          </button>
        )}
        {sceneMode === "playback" ? (
          <button style={navText} onClick={returnToGallery}>
            ← All Videos
          </button>
        ) : (
          <Link
            href="/experience"
            style={{ ...dimText, pointerEvents: "auto" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.textSecondary)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.textDim)
            }
          >
            ← Experience
          </Link>
        )}
      </div>

      {/* ── Gallery mode: heading above the card grid ─────────────────────── */}
      {sceneMode === "gallery" && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-center pt-7"
          style={{ pointerEvents: "none", ...hudVisible }}
        >
          <p style={{ ...dimText, marginBottom: "6px" }}>360° Experiences</p>
          <p
            style={{
              color: BRAND.textSecondary,
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "Helvetica Neue, Arial, sans-serif",
            }}
          >
            Select an Experience
          </p>
        </div>
      )}

      {/* ── Playback mode: transport controls ────────────────────────────── */}
      {sceneMode === "playback" && (
        <div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex items-center gap-5"
          style={{
            ...hudVisible,
            pointerEvents: "none",
            border: `1px solid ${BRAND.border}`,
            background: "rgba(11,13,16,0.68)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            style={{ ...navText, padding: "10px 24px", borderRight: `1px solid ${BRAND.border}` }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            style={{ ...navText, padding: "10px 24px" }}
            onClick={toggleMute}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      )}

      {/* ── Playback mode: drag hint ──────────────────────────────────────── */}
      {sceneMode === "playback" && activeVideo?.is360 && (
        <div
          className="absolute bottom-7 right-7 z-10"
          style={{
            opacity: sceneReady ? 0.35 : 0,
            transition: "opacity 2.5s ease 2s",
            pointerEvents: "none",
          }}
        >
          <p style={dimText}>Drag to look</p>
        </div>
      )}

      {/* ── Playback mode: video title ────────────────────────────────────── */}
      {sceneMode === "playback" && activeVideo && (
        <div
          className="absolute bottom-7 left-7 z-10"
          style={{ ...hudVisible, pointerEvents: "none" }}
        >
          <p
            style={{
              color: BRAND.teal,
              fontSize: "9px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontFamily: "Helvetica Neue, Arial, sans-serif",
              marginBottom: "4px",
            }}
          >
            {activeVideo.category}
          </p>
          <p
            style={{
              color: BRAND.textSecondary,
              fontSize: "13px",
              fontFamily: "Georgia, serif",
              fontWeight: "300",
            }}
          >
            {activeVideo.title}
          </p>
        </div>
      )}
    </div>
  );
}
