/**
 * ─── AirSea Brand Tokens ──────────────────────────────────────────────────────
 *
 * Palette derived from the real AirSea logo (675×370 PNG) and website
 * visual language at airseapacking.com.
 *
 * Primary brand color: steel teal-blue (#1C6E8E) — extracted from the
 * "AirSea" wordmark and bird symbol in the official logo.
 *
 * Secondary brand tone: warm sage-grey (#C2C6B2) — extracted from the
 * decorative circle ring and wave motif surrounding the bird.
 *
 * Everything else is derived to serve these two anchors in a dark,
 * architectural spatial environment while keeping legibility, contrast,
 * and brand fidelity as non-negotiable constraints.
 *
 * ─── Visual Identity Direction ────────────────────────────────────────────────
 *
 * AirSea serves white-glove logistics, fine art, private households, luxury
 * retail, and designer/architect receiving. The brand is:
 *   RESTRAINED · TRUSTWORTHY · ARCHITECTURAL · PREMIUM · CALM
 *
 * It is NOT:
 *   neon · gamey · sci-fi-gradient · loud · maximalist · generic enterprise
 *
 * The teal is used precisely — as an accent, not a flood fill.
 * The sage is used for warmth and refinement, never loudness.
 * Backgrounds are deep neutrals with blue-black undertones.
 * Typography reads as editorial, not technical.
 *
 * ─── Logo Usage Rules ─────────────────────────────────────────────────────────
 *
 * DO:
 *   - Use the logo on dark or mid-tone surfaces where it has room to breathe
 *   - Keep the logo at its natural proportions (1.82 : 1 width : height)
 *   - Give the logo a minimum clear zone equal to the height of "PACKING"
 *   - Use the logo as a single branded anchor, not repeated decoration
 *   - Allow the logo to read as part of the architecture (reception, entry)
 *
 * DO NOT:
 *   - Place the logo on top of busy 360 video content
 *   - Crop, stretch, extrude, glow, or animate the logo
 *   - Place the logo in the same visual plane as interactive controls
 *   - Make the logo compete with the primary content slate
 *   - Add drop shadows, bevels, or emissive glow to the logo mesh
 *   - Use a tinted or colorized version of the logo
 */

// ─── Core Brand Palette ───────────────────────────────────────────────────────

export const BRAND = {
  // Direct logo extractions
  teal: "#1C6E8E",         // Primary — "AirSea" wordmark + bird
  tealLight: "#2485A8",    // Hover/interactive teal — +15% lightness
  tealDim: "#155870",      // Pressed/active teal — -10% lightness
  sage: "#C2C6B2",         // Secondary — circle ring + wave decoration
  sageDim: "#9A9E8E",      // Sage at reduced opacity for secondary text use

  // Scene backgrounds (dark, architectural, blue-black undertone)
  bg:          "#0B0D10",  // Scene clear / outermost bg — near-black, cool
  bgElevated:  "#111418",  // Raised surface — cards, floor plane
  panel:       "#181C20",  // Panel surface — HolographicSlate back
  panelRaised: "#1E2228",  // Elevated panel — button hover, focus areas

  // Borders and structure
  border:        "#252B32", // Subtle structural line
  borderBright:  "#2E3640", // Hover border
  borderAccent:  "#1C6E8E", // Teal border for selected/active state

  // Text
  textPrimary:   "#EEF0EE", // Near-white with a slight cool-warm mix
  textSecondary: "#8A9298", // Mid grey — body copy, secondary labels
  textDim:       "#505860", // Quiet — disabled, placeholder, legal

  // Interactive
  accentFill:       "#1C6E8E", // Primary action background
  accentFillHover:  "#2485A8", // Hover
  accentFillActive: "#155870", // Pressed
  accentFillSubtle: "rgba(28, 110, 142, 0.12)", // Ghost tint

  // Status / framing
  mediaFrame:  "#0E1215",  // The surface immediately around 360 video frames
  highlight:   "#1C6E8E",  // Interactive highlight ring
  disabled:    "#2C3038",  // Disabled state background
  disabledText:"#404850",  // Disabled text

} as const;

// ─── Babylon Color3 helpers ───────────────────────────────────────────────────
// Avoid importing Color3 here — these are just the raw float tuples.
// Call hexToColor3(BRAND.teal) inside Babylon modules.

export function hexToFloat3(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ];
}

// ─── Logo asset ───────────────────────────────────────────────────────────────

export const LOGO = {
  /** Local path served from /public — use for <img> in DOM and Babylon Texture */
  src: "/airsealogo.png",
  /** Intrinsic dimensions of the PNG asset */
  width: 675,
  height: 370,
  /** Aspect ratio — always maintain this when sizing the logo in 3D */
  aspectRatio: 675 / 370, // 1.824
} as const;

// ─── Typography tokens ────────────────────────────────────────────────────────
// Font stacks matched to AirSea's editorial-corporate register.

export const FONT = {
  /** Wordmarks, large headings — humanist with warmth */
  display: "Georgia, 'Times New Roman', serif",
  /** Body, labels, UI — clean, neutral, legible */
  body: "'Helvetica Neue', Arial, sans-serif",
  /** Tracked small caps — category labels, certifications */
  caps: "'Helvetica Neue', Arial, sans-serif",
} as const;
