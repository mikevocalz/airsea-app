"use client";

/**
 * Experience Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin orchestration shell. SceneCanvas owns the full Babylon lifecycle.
 * This component renders:
 *   1. The full-viewport canvas (via SceneCanvas, SSR-disabled)
 *   2. A minimal DOM overlay with:
 *      - Real AirSea logo (top-left)
 *      - Navigation controls (top-right)
 *      - Usage hint (bottom-center)
 *      - XR entry when supported
 *
 * Brand rule: DOM overlay must feel like a glass panel at a premium reception,
 * not a gaming HUD. Every element is restrained. The logo gets space.
 */

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useAirSeaExperienceStore } from "@/store/useAirSeaExperienceStore";
import { LOGO, BRAND } from "@/lib/brand/tokens";

const SceneCanvas = dynamic(
  () => import("@/components/babylon/SceneCanvas"),
  { ssr: false, loading: () => <ExperienceLoader /> }
);

function ExperienceLoader() {
  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{ background: BRAND.bg }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo visible during load — establishes brand immediately */}
        <Image
          src={LOGO.src}
          alt="AirSea Packing"
          width={160}
          height={Math.round(160 / LOGO.aspectRatio)}
          priority
          style={{ opacity: 0.7 }}
        />
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border border-t-transparent animate-spin"
            style={{ borderColor: BRAND.teal }}
          />
          <p
            className="text-xs tracking-[0.3em] uppercase font-light"
            style={{ color: BRAND.textSecondary }}
          >
            Loading Experience
          </p>
        </div>
      </div>
    </div>
  );
}

function ExperienceHUD() {
  const sceneReady = useAirSeaExperienceStore((s) => s.sceneReady);
  const xrSupported = useAirSeaExperienceStore((s) => s.xrSupported);

  const visible: React.CSSProperties = {
    opacity: sceneReady ? 1 : 0,
    transition: "opacity 1.4s ease",
  };

  return (
    <>
      {/* ── Top-left: real AirSea logo ──────────────────────────────────── */}
      {/* Placement: top-left with generous breathing room.                 */}
      {/* Sits on a very subtle dark scrim so it reads against any video.   */}
      {/* Never competes with the 3D panels (which live center and right).  */}
      <div
        className="absolute top-0 left-0 z-10 p-6"
        style={{
          ...visible,
          background:
            "linear-gradient(135deg, rgba(11,13,16,0.82) 0%, transparent 100%)",
        }}
      >
        <Link href="/" aria-label="AirSea Packing — Home">
          <Image
            src={LOGO.src}
            alt="AirSea Packing"
            width={148}
            height={Math.round(148 / LOGO.aspectRatio)}
            priority
            style={{
              // Logo is on a dark bg — invert to white for legibility
              filter: "brightness(0) invert(1)",
              opacity: 0.92,
            }}
          />
        </Link>
      </div>

      {/* ── Top-right: nav controls ─────────────────────────────────────── */}
      <div
        className="absolute top-0 right-0 z-10 p-6 flex items-center gap-6"
        style={{
          ...visible,
          background:
            "linear-gradient(225deg, rgba(11,13,16,0.7) 0%, transparent 100%)",
        }}
      >
        {xrSupported && (
          <button
            className="text-xs tracking-[0.2em] uppercase border px-4 py-2 transition-colors"
            style={{
              color: BRAND.teal,
              borderColor: `${BRAND.teal}60`,
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                BRAND.accentFillSubtle;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
            onClick={() => console.info("[XR] Immersive VR requested")}
          >
            Enter XR
          </button>
        )}

        <Link
          href="/contact"
          className="text-xs tracking-[0.2em] uppercase transition-colors"
          style={{ color: BRAND.teal }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              BRAND.tealLight)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.teal)
          }
        >
          Request a Quote
        </Link>

        <Link
          href="/"
          className="text-xs tracking-[0.2em] uppercase transition-colors"
          style={{ color: BRAND.textDim }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              BRAND.textSecondary)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.textDim)
          }
        >
          ← Exit
        </Link>
      </div>

      {/* ── Bottom: mode tabs ──────────────────────────────────────────── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0"
        style={{
          opacity: sceneReady ? 1 : 0,
          transition: "opacity 2s ease 1s",
          border: `1px solid ${BRAND.border}`,
          background: "rgba(11,13,16,0.72)",
          backdropFilter: "blur(8px)",
        }}
      >
        {(
          [
            { label: "360°", href: "/experience/360" },
            { label: "Interactive", href: null },
            { label: "Immersive", href: null },
          ] as const
        ).map(({ label, href }, i) => {
          const isActive = label === "Interactive";
          const isLast = i === 2;
          const sharedStyle: React.CSSProperties = {
            color: isActive ? BRAND.teal : BRAND.textDim,
            background: isActive ? `${BRAND.teal}14` : "transparent",
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            padding: "10px 22px",
            borderRight: isLast ? "none" : `1px solid ${BRAND.border}`,
            cursor: "pointer",
            transition: "color 0.2s, background 0.2s",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            display: "block",
            border: "none",
          };
          if (href) {
            return (
              <Link key={label} href={href} style={sharedStyle}>
                {label}
              </Link>
            );
          }
          return (
            <button key={label} style={sharedStyle}>
              {label}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default function ExperiencePage() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: BRAND.bg }}
    >
      <SceneCanvas />
      <ExperienceHUD />
    </div>
  );
}
