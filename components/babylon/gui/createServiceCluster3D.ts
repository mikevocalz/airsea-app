import type { Scene } from "@babylonjs/core/scene";
import type { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import type { SectionId, AirSeaSection } from "@/types/experience";
import { BRAND, hexToFloat3 } from "@/lib/brand/tokens";

/**
 * ─── Navigation Strip — Vertical, Subordinate, Right Wall Zone ───────────────
 *
 * Design principle: navigation is a catalog, not a dashboard.
 * It should read like a table of contents at the edge of a printed brief —
 * present, legible, but never competing with the primary reading surface.
 *
 * Why vertical StackPanel vs flat grid:
 *   A vertical strip on the right side mirrors physical wayfinding (a wall-
 *   mounted service directory). The flat 5×2 grid centered below the slate
 *   created a kiosk/vending-machine composition. Vertical strips are
 *   architectural; grids are dashboards.
 *
 * Why right side (X=+2.8) vs center:
 *   Separates navigation laterally from content. The slate lives LEFT, navigation
 *   lives RIGHT. The user's gaze moves: content (left) ↔ navigation (right).
 *   This is how premium wayfinding works in physical architecture.
 *
 * Why 6 services vs 10:
 *   Editorial restraint. 10 equal-weight buttons signal "we couldn't choose."
 *   6 primary services signal "these are what matter most." The full catalog
 *   is available at /solutions. Premium experiences curate, not enumerate.
 *
 * ─── Spatial Placement ────────────────────────────────────────────────────────
 *
 * Position: (2.8, 1.5, -5.4)
 *   X=+2.8: Right wall zone — +26° from gaze axis. Clearly peripheral,
 *            clearly purposeful. Reaches without straining.
 *   Y=1.5:  Slightly below slate center (1.65) — navigation is subordinate.
 *   Z=-5.4: Same depth band as slate (Z=-5.0). Laterally separated, not
 *            depth-separated — they're peers spatially, not layers.
 */

export interface ServiceCluster {
  setActiveSection(id: SectionId): void;
  setVisible(visible: boolean): void;
  dispose(): void;
}

export async function createServiceCluster3D(
  scene: Scene,
  manager: GUI3DManager,
  sections: AirSeaSection[],
  onSelect: (id: SectionId) => void
): Promise<ServiceCluster> {
  const { StackPanel3D } = await import("@babylonjs/gui/3D/controls/stackPanel3D");
  const { HolographicButton } = await import("@babylonjs/gui/3D/controls/holographicButton");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { Color3 } = await import("@babylonjs/core/Maths/math.color");

  const [tr, tg, tb] = hexToFloat3(BRAND.teal);
  const [pr, pg, pb] = hexToFloat3(BRAND.panel);
  const [prr, prg, prb] = hexToFloat3(BRAND.panelRaised);

  // Vertical strip — StackPanel3D(true) = vertical
  const stack = new StackPanel3D(true);
  stack.margin = 0.008;

  manager.addControl(stack);
  stack.position = new Vector3(2.8, 1.5, -5.4);

  let currentActiveId: SectionId = sections[0].id;
  const buttonMap = new Map<string, InstanceType<typeof HolographicButton>>();

  for (const section of sections) {
    const btn = new HolographicButton(`btn_${section.id}`);
    // Narrow and wide — reads as a label strip, not a button grid
    btn.scaling = new Vector3(0.36, 0.14, 0.14);
    btn.text = section.label;

    btn.pointerEnterAnimation = () => {
      if (btn.backMaterial) {
        btn.backMaterial.albedoColor = new Color3(
          prr + (tr - prr) * 0.25,
          prg + (tg - prg) * 0.25,
          prb + (tb - prb) * 0.25
        );
      }
    };

    btn.pointerOutAnimation = () => {
      if (btn.backMaterial) {
        if (currentActiveId === section.id) {
          btn.backMaterial.albedoColor = new Color3(tr * 0.2, tg * 0.2, tb * 0.2);
        } else {
          btn.backMaterial.albedoColor = new Color3(pr, pg, pb);
        }
      }
    };

    btn.onPointerClickObservable.add(() => onSelect(section.id));
    stack.addControl(btn);
    buttonMap.set(section.id, btn);
  }

  const setActiveSection = (id: SectionId) => {
    currentActiveId = id;
    for (const [sectionId, btn] of buttonMap) {
      if (btn.backMaterial) {
        btn.backMaterial.albedoColor =
          sectionId === id
            ? new Color3(tr * 0.2, tg * 0.2, tb * 0.2)
            : new Color3(pr, pg, pb);
      }
    }
  };

  setActiveSection(sections[0].id);

  return {
    setActiveSection,
    setVisible(visible) {
      stack.isVisible = visible;
      for (const btn of buttonMap.values()) btn.isVisible = visible;
    },
    dispose() { stack.dispose(); },
  };
}
