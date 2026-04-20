import type { Scene } from "@babylonjs/core/scene";
import type { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import type { SectionId, AirSeaSection } from "@/types/experience";
import { BRAND, hexToFloat3 } from "@/lib/brand/tokens";

/**
 * ─── Navigation Bar — 5×2 flat grid, centered on gaze axis ──────────────────
 *
 * Position: (0, 0.88, -3.5)
 *   Center of gaze axis — no forced lateral eye movement.
 *   Y=0.88: natural downward glance from eye height (1.6) — −11° vertical.
 *   Z=−3.5: "interact" depth band — closer than the reading plane but not
 *           inside personal space.
 *
 * Layout: PlanePanel columns=5, producing a 5×2 flat grid for 10 sections.
 * Flat plane rather than sphere arc eliminates radial button misalignment and
 * makes button labels read consistently at every position.
 *
 * Interaction states:
 *   Resting:  dark charcoal panel, cool-white label
 *   Hover:    brand teal tint — present, not loud
 *   Selected: brand teal fill at low alpha — "chosen and confirmed"
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
  const { PlanePanel } = await import("@babylonjs/gui/3D/controls/planePanel");
  const { HolographicButton } = await import("@babylonjs/gui/3D/controls/holographicButton");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { Color3 } = await import("@babylonjs/core/Maths/math.color");

  const [tr, tg, tb] = hexToFloat3(BRAND.teal);
  const [pr, pg, pb] = hexToFloat3(BRAND.panel);

  const panel = new PlanePanel("navBar");
  panel.columns = 5;
  panel.margin = 0.015;

  manager.addControl(panel);
  panel.position = new Vector3(0, 0.88, -3.5);

  let currentActiveId: SectionId = sections[0].id;
  const buttonMap = new Map<string, InstanceType<typeof HolographicButton>>();

  for (const section of sections) {
    const btn = new HolographicButton(`btn_${section.id}`);
    btn.scaling = new Vector3(0.26, 0.19, 0.19);
    btn.text = section.label;

    btn.pointerEnterAnimation = () => {
      if (btn.backMaterial) {
        btn.backMaterial.albedoColor = new Color3(
          pr + (tr - pr) * 0.2,
          pg + (tg - pg) * 0.2,
          pb + (tb - pb) * 0.2
        );
      }
    };

    btn.pointerOutAnimation = () => {
      if (btn.backMaterial) {
        if (currentActiveId === section.id) {
          btn.backMaterial.albedoColor = new Color3(tr * 0.22, tg * 0.22, tb * 0.22);
        } else {
          btn.backMaterial.albedoColor = new Color3(pr, pg, pb);
        }
      }
    };

    btn.onPointerClickObservable.add(() => onSelect(section.id));
    panel.addControl(btn);
    buttonMap.set(section.id, btn);
  }

  const setActiveSection = (id: SectionId) => {
    currentActiveId = id;
    for (const [sectionId, btn] of buttonMap) {
      if (btn.backMaterial) {
        btn.backMaterial.albedoColor =
          sectionId === id
            ? new Color3(tr * 0.25, tg * 0.25, tb * 0.25)
            : new Color3(pr, pg, pb);
      }
    }
  };

  setActiveSection(sections[0].id);

  return {
    setActiveSection,
    setVisible(visible) {
      panel.isVisible = visible;
      for (const btn of buttonMap.values()) {
        btn.isVisible = visible;
      }
    },
    dispose() {
      panel.dispose();
    },
  };
}
