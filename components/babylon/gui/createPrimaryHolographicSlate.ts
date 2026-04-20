import type { Scene } from "@babylonjs/core/scene";
import type { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import type { AirSeaSection } from "@/types/experience";
import { BRAND, FONT } from "@/lib/brand/tokens";

/**
 * ─── HolographicSlate — AirSea Brand Styling ─────────────────────────────────
 *
 * Visual language: AirSea is restrained, architectural, premium. The slate
 * reads like a quality printed brief — dark surface, cool-white text, teal
 * accent that derives directly from the logo's primary color.
 *
 * No glow. No neon. No gradients that don't serve the content.
 * The accent appears only on the tagline and CTA — never as a flood fill.
 *
 * ─── Spatial Placement ────────────────────────────────────────────────────────
 *
 * Position: (0, 1.7, -4.2)
 *   Dead center on the gaze axis — zero forced lateral head rotation to read.
 *   Y=1.7: eye height +0.1 (natural slight upward gaze to primary content).
 *   Z=−4.2: "read" depth band — comfortable reading distance, slate dominant.
 *   Logo plaque is 2.3m deeper at Z=−6.5 — no depth plane competition.
 */

interface PropBlock {
  headline: { text: string };
  body: { text: string };
}

export interface PrimarySlate {
  updateSection(section: AirSeaSection): void;
  highlightCTA(active: boolean): void;
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
  slate.dimensions = new Vector2(1.8, 1.1);
  slate.titleBarHeight = 0.12;
  slate.minDimensions = new Vector2(1.0, 0.6);
  slate.fitContentToDimensions = true;
  slate.contentResolution = { width: 900, height: 550 };

  manager.addControl(slate);
  slate.position = new Vector3(0, 1.7, -4.2);

  // ── 2D content layout ────────────────────────────────────────────────────
  const root = new StackPanel("slateRoot");
  root.isVertical = true;
  root.width = "100%";
  root.height = "100%";
  root.paddingLeft = "32px";
  root.paddingRight = "32px";
  root.paddingTop = "22px";
  root.paddingBottom = "22px";

  // Tagline — italic, teal accent from real logo color
  const taglineBlock = new TextBlock("tagline");
  taglineBlock.height = "50px";
  taglineBlock.fontSize = 16;
  taglineBlock.color = BRAND.teal;
  taglineBlock.fontFamily = FONT.display;
  taglineBlock.fontStyle = "italic";
  taglineBlock.textWrapping = true;
  taglineBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  taglineBlock.paddingBottom = "8px";

  // Structural divider — brand border color, thin
  const divider = new Rectangle("divider");
  divider.height = "1px";
  divider.width = "100%";
  divider.thickness = 0;
  divider.background = BRAND.border;
  divider.paddingBottom = "12px";

  // Value props
  const propsPanel = new StackPanel("propsPanel");
  propsPanel.isVertical = true;
  propsPanel.height = "310px";
  propsPanel.width = "100%";

  const propBlocks: PropBlock[] = [];
  for (let i = 0; i < 3; i++) {
    const headline = new TextBlock(`hl${i}`);
    headline.height = "28px";
    headline.fontSize = 14;
    headline.color = BRAND.textPrimary;
    headline.fontFamily = FONT.body;
    headline.fontWeight = "600";
    headline.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

    const body = new TextBlock(`body${i}`);
    body.height = "56px";
    body.fontSize = 12;
    body.color = BRAND.textSecondary;
    body.fontFamily = FONT.body;
    body.textWrapping = true;
    body.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    body.paddingBottom = "8px";

    propsPanel.addControl(headline);
    propsPanel.addControl(body);
    propBlocks.push({ headline, body });
  }

  // CTA strip — teal outline, no fill. Restrained, not a button-shaped shout.
  const ctaRect = new Rectangle("ctaRect");
  ctaRect.height = "48px";
  ctaRect.width = "100%";
  ctaRect.thickness = 1;
  ctaRect.color = BRAND.teal;
  ctaRect.background = "rgba(0,0,0,0)";
  ctaRect.cornerRadius = 2;

  const ctaText = new TextBlock("ctaText");
  ctaText.fontSize = 13;
  ctaText.color = BRAND.teal;
  ctaText.fontFamily = FONT.body;
  ctaText.fontWeight = "500";
  ctaRect.addControl(ctaText);

  root.addControl(taglineBlock);
  root.addControl(divider);
  root.addControl(propsPanel);
  root.addControl(ctaRect);

  slate.content = root;

  // ── Populate ─────────────────────────────────────────────────────────────
  const populateSection = (section: AirSeaSection) => {
    slate.title = section.label;
    taglineBlock.text = section.tagline;
    ctaText.text = `\u2192  ${section.ctaLabel}`;

    for (let i = 0; i < 3; i++) {
      propBlocks[i].headline.text = section.valueProps[i].headline;
      propBlocks[i].body.text = section.valueProps[i].body;
    }

    // Accent updates with section color (all are teal palette derivatives)
    taglineBlock.color = section.accentHex;
    ctaRect.color = section.accentHex;
    ctaText.color = section.accentHex;
  };

  populateSection(initialSection);

  return {
    updateSection(section) {
      populateSection(section);
    },
    highlightCTA(active) {
      ctaRect.background = active
        ? BRAND.accentFillSubtle
        : "rgba(0,0,0,0)";
      ctaRect.thickness = active ? 2 : 1;
    },
    setVisible(visible) {
      slate.isVisible = visible;
    },
    dispose() {
      slate.dispose();
    },
  };
}
