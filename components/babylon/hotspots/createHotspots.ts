import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { BRAND } from "@/lib/brand/tokens";

/**
 * Hotspots are small pickable glowing spheres anchored to world positions.
 * They surface contextual sub-content without leaving the main scene.
 *
 * Each hotspot:
 *   - Is a 0.12-radius sphere with emissive material
 *   - Pulses gently via a Babylon Animation loop (scale oscillation)
 *   - On pointer-enter: scale up slightly, brighten
 *   - On pointer-click: fires the provided callback with its id
 *
 * XR-forward: Hotspots work with the same pointer/pick system on desktop
 * and in WebXR. In XR, a controller pointer ray will hit these meshes
 * identically to a desktop mouse ray — no code changes needed.
 */

export interface Hotspot {
  id: string;
  mesh: Mesh;
  dispose(): void;
}

export interface HotspotDefinition {
  id: string;
  position: [number, number, number];
  label: string;
  accentHex: string;
}

export async function createHotspots(
  scene: Scene,
  definitions: HotspotDefinition[],
  onClick: (id: string) => void
): Promise<Hotspot[]> {
  const { MeshBuilder } = await import("@babylonjs/core/Meshes/meshBuilder");
  const { StandardMaterial } = await import("@babylonjs/core/Materials/standardMaterial");
  const { Color3 } = await import("@babylonjs/core/Maths/math.color");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { Animation } = await import("@babylonjs/core/Animations/animation");

  return definitions.map((def) => {
    const mesh = MeshBuilder.CreateSphere(
      `hotspot_${def.id}`,
      { diameter: 0.12, segments: 16 },
      scene
    );
    mesh.position = new Vector3(...def.position);
    mesh.isPickable = true;
    mesh.metadata = { hotspotId: def.id };

    const mat = new StandardMaterial(`hs_mat_${def.id}`, scene);
    const [r, g, b] = hexToRgb(def.accentHex);
    mat.emissiveColor = new Color3(r, g, b);
    mat.disableLighting = true;
    mesh.material = mat;

    // Gentle float animation
    const floatAnim = new Animation(
      `hs_float_${def.id}`,
      "position.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    floatAnim.setKeys([
      { frame: 0, value: def.position[1] },
      { frame: 15, value: def.position[1] + 0.04 },
      { frame: 30, value: def.position[1] },
    ]);
    scene.beginDirectAnimation(mesh, [floatAnim], 0, 30, true);

    // Pointer interactions
    const baseScale = new Vector3(1, 1, 1);
    const hoverScale = new Vector3(1.4, 1.4, 1.4);

    mesh.actionManager = null; // use pointer observables instead (XR-compatible)

    const enterObs = scene.onPointerObservable.add((pi) => {
      if (pi.pickInfo?.pickedMesh === mesh) {
        mesh.scaling = hoverScale;
        mat.emissiveColor = new Color3(
          Math.min(r * 1.6, 1),
          Math.min(g * 1.6, 1),
          Math.min(b * 1.6, 1)
        );
      }
    });

    const leaveObs = scene.onPointerObservable.add((pi) => {
      if (!pi.pickInfo || pi.pickInfo.pickedMesh !== mesh) {
        mesh.scaling = baseScale;
        mat.emissiveColor = new Color3(r, g, b);
      }
    });

    scene.onPointerObservable.add((pi) => {
      if (
        pi.type === 4 /* POINTERUP */ &&
        pi.pickInfo?.pickedMesh === mesh
      ) {
        onClick(def.id);
      }
    });

    return {
      id: def.id,
      mesh,
      dispose() {
        scene.stopAnimation(mesh);
        scene.onPointerObservable.remove(enterObs);
        scene.onPointerObservable.remove(leaveObs);
        mat.dispose();
        mesh.dispose();
      },
    };
  });
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}
