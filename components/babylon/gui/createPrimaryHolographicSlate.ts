import type { Scene } from "@babylonjs/core/scene";
import type { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import type { AirSeaSection } from "@/types/experience";
import { BRAND, FONT } from "@/lib/brand/tokens";

/**
 * ─── HolographicSlate — Editorial Brand Surface ───────────────────────────────
 *
 * This is the ONE dominant knowledge surface in the scene.
 * Everything else is subordinate to it. Design principles enforced here:
 *
 * 1. Title bar zeroed — MRTK chrome reads as Microsoft demo. The service name
 *    lives inside the content canvas as a heading, not a window title.
 *
 * 2. Left-of-center placement — like a wall-mounted brief in a partner meeting
 *    room. Off-axis composition is more architectural than centered kiosk.
 *
 * 3. Two value props, not three — editorial restraint. Three cramped blocks
 *    signal "fill the space." Two well-spaced props signal "we chose carefully."
 *    The third is available via /solutions.
 *
 * 4. No CTA button/border — a teal text label with an arrow. The border-rect
 *    CTA reads as software UI. A text label reads as editorial direction.
 *
 * ─── Spatial Placement ────────────────────────────────────────────────────────
 *
 * Position: (-1.4, 1.65, -5.0)
 *   X=-1.4: Left of center — -13° horizontal from gaze axis. Natural for a
 *           wall-mounted reading surface. Camera initial gaze points here.
 *   Y=1.65: Slightly above eye height (1.6). Content reads at a comfortable
 *           downward-neutral angle — like a standing lectern.
 *   Z=-5.0: "Read" zone. 5m creates a generous reading distance where the full
 *           slate fills approximately 35° of the visual field — premium, not
 *           cramped. The nav is at Z=-5.4, same depth band, separated laterally.
 */

interface PropBlock {
  headline: { text: string };
  body: { text: string };
}

export interface PrimarySlate {
  updateSection(section: AirSeaSection): void;
  setVisible(visible: boolean): void;
  dispose(): void;
}

export async function createPrimaryHolographicSlate(
  scene: Scene,
  manager: GUI3DManager,
  initialSection: AirSeaSection
): Promise<PrimarySlate> {
  const { HolographicSlate } = await import("@babylonjs/gui/3D/controls/holographicSlate");
  const { StackPanel } = await import("@babylonjs/gui/2D/controls/stackPanel");
  const { TextBlock } = await import("@babylonjs/gui/2D/controls/textBlock");
  const { Rectangle } = await import("@babylonjs/gui/2D/controls/rectangle");
  const { Control } = await import("@babylonjs/gui/2D/controls/control");
  const { Vector2, Vector3 } = await import("@babylonjs/core/Maths/math.vector");

  const slate = new HolographicSlate("primarySlate");
  slate.dimensions = new Vector2(2.2, 1.4);
  slate.titleBarHeight = 0;        // kill OS chrome — brand content only
  slate.minDimensions = new Vector2(1.2, 0.7);
  slate.fitContentToDimensions = true;
  slate.contentResolution = { width: 880, height: 560 };

  manager.addControl(slate);
  slate.position = new Vector3(-1.4, 1.65, -5.0);

  // ── 2D content canvas ────────────────────────────────────────────────────
  const root = new StackPanel("slateRoot");
  root.isVertical = true;
  root.width = "100%";
  root.height = "100%";
  root.paddingLeft = "44px";
  root.paddingRight = "44px";
  root.paddingTop = "32px";
  root.paddingBottom = "28px";

  // Service name — large, architectural weight
  const serviceLabel = new TextBlock("serviceLabel");
  serviceLabel.height = "18px";
  serviceLabel.fontSize = 11;
  serviceLabel.color = BRAND.teal;
  serviceLabel.fontFamily = FONT.body;
  serviceLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  serviceLabel.paddingBottom = "10px";

  const serviceHeading = new TextBlock("serviceHeading");
  serviceHeading.height = "58px";
  serviceHeading.fontSize = 28;
  serviceHeading.color = BRAND.textPrimary;
  serviceHeading.fontFamily = FONT.display;
  serviceHeading.fontWeight = "300";
  serviceHeading.textWrapping = true;
  serviceHeading.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  serviceHeading.paddingBottom = "4px";

  // Tagline — italic, brand teal, editorial voice
  const taglineBlock = new TextBlock("tagline");
  taglineBlock.height = "42px";
  taglineBlock.fontSize = 14;
  taglineBlock.color = BRAND.teal;
  taglineBlock.fontFamily = FONT.display;
  taglineBlock.fontStyle = "italic";
  taglineBlock.textWrapping = true;
  taglineBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  taglineBlock.paddingBottom = "16px";

  // Rule — thin separator, brand border color
  const divider = new Rectangle("divider");
  divider.height = "1px";
  divider.width = "100%";
  divider.thickness = 0;
  divider.background = BRAND.border;
  divider.paddingBottom = "18px";

  // Value props — 2 props, generous vertical breathing room
  const propsPanel = new StackPanel("propsPanel");
  propsPanel.isVertical = true;
  propsPanel.height = "260px";
  propsPanel.width = "100%";

  const propBlocks: PropBlock[] = [];
  for (let i = 0; i < 2; i++) {
    const headline = new TextBlock(`hl${i}`);
    headline.height = "26px";
    headline.fontSize = 13;
    headline.color = BRAND.textPrimary;
    headline.fontFamily = FONT.body;
    headline.fontWeight = "500";
    headline.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    headline.paddingTop = i === 0 ? "0px" : "12px";

    const body = new TextBlock(`body${i}`);
    body.height = "70px";
    body.fontSize = 12;
    body.color = BRAND.textSecondary;
    body.fontFamily = FONT.body;
    body.textWrapping = true;
    body.lineSpacing = "4px";
    body.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    body.paddingBottom = "6px";

    propsPanel.addControl(headline);
    propsPanel.addControl(body);
    propBlocks.push({ headline, body });
  }

  // CTA — text-only, no bordered rect. Editorial direction, not a software button.
  const ctaText = new TextBlock("ctaText");
  ctaText.height = "32px";
  ctaText.fontSize = 11;
  ctaText.fontFamily = FONT.body;
  ctaText.fontWeight = "500";
  ctaText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

  root.addControl(serviceLabel);
  root.addControl(serviceHeading);
  root.addControl(taglineBlock);
  root.addControl(divider);
  root.addControl(propsPanel);
  root.addControl(ctaText);

  slate.content = root;

  // ── Populate ─────────────────────────────────────────────────────────────
  const populateSection = (section: AirSeaSection) => {
    serviceLabel.text = "AirSea Packing".toUpperCase();
    serviceHeading.text = section.label;
    taglineBlock.text = section.tagline;
    ctaText.text = `\u2192  ${section.ctaLabel}`;
    ctaText.color = section.accentHex;

    // Only populate first 2 props — editorial restraint
    for (let i = 0; i < 2; i++) {
      propBlocks[i].headline.text = section.valueProps[i].headline;
      propBlocks[i].body.text = section.valueProps[i].body;
    }

    taglineBlock.color = section.accentHex;
  };

  populateSection(initialSection);

  return {
    updateSection(section) { populateSection(section); },
    setVisible(visible) { slate.isVisible = visible; },
    dispose() { slate.dispose(); },
  };
}
