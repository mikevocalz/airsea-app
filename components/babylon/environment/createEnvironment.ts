import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { BRAND, hexToFloat3 } from "@/lib/brand/tokens";

/**
 * ─── Environment — Architectural Chamber ─────────────────────────────────────
 *
 * Design principle: the environment is a room, not a void.
 * It defines space without competing with content.
 *
 * Three layers:
 *   1. Floor — dark architectural plane, no grid.
 *      GridMaterial reads as "Babylon demo." A matte dark plane reads as space.
 *   2. Fog — brand-tinted, tighter than before. Makes the 360 sphere feel like
 *      atmosphere, not a texture wrapping a ball.
 *   3. Distant walls — barely-there geometry (alpha ~0.3) at far Z and sides.
 *      These define a room without announcing themselves. The 360 video is still
 *      the dominant environment; the walls are spatial grammar, not decoration.
 *
 * What was removed and why:
 *   - GridMaterial: tutorial artifact, not premium
 *   - Torus ring: generic sci-fi, no brand relevance
 *   - Everything decorative that didn't serve the spatial narrative
 */

export interface EnvironmentLayer {
  floor: Mesh;
  dispose(): void;
}

export async function createEnvironment(scene: Scene): Promise<EnvironmentLayer> {
  const { MeshBuilder } = await import("@babylonjs/core/Meshes/meshBuilder");
  const { StandardMaterial } = await import("@babylonjs/core/Materials/standardMaterial");
  const { Color3, Color4 } = await import("@babylonjs/core/Maths/math.color");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { Scene: BabScene } = await import("@babylonjs/core/scene");
  const { hexToFloat3: h3 } = await import("@/lib/brand/tokens");

  const [br, bg, bb] = h3(BRAND.bg);
  const [er, eg, eb] = h3(BRAND.bgElevated);

  // ── Scene clear ────────────────────────────────────────────────────────────
  scene.clearColor = new Color4(br, bg, bb, 1);

  // ── Fog — tighter, atmospheric ─────────────────────────────────────────────
  // Density 0.018 ensures far geometry (Z>12) fades into the brand background.
  // This makes the 360 sphere read as atmosphere rather than "texture on a ball."
  scene.fogMode = BabScene.FOGMODE_EXP2;
  scene.fogColor = new Color3(br, bg, bb);
  scene.fogDensity = 0.018;

  // ── Floor — dark architectural plane ──────────────────────────────────────
  // No grid. Matte dark surface with a barely-perceptible lighter seam at the
  // edges to define ground plane without drawing attention to it.
  const floor = MeshBuilder.CreateGround(
    "envFloor",
    { width: 60, height: 60, subdivisions: 1 },
    scene
  );
  floor.position.y = -0.01;
  floor.isPickable = false;

  const floorMat = new StandardMaterial("floorMat", scene);
  floorMat.diffuseColor = new Color3(er * 0.6, eg * 0.6, eb * 0.6);
  floorMat.specularColor = new Color3(0.03, 0.04, 0.05); // barely-there reflection
  floorMat.ambientColor = new Color3(er * 0.3, eg * 0.3, eb * 0.3);
  floorMat.alpha = 0.92;
  floor.material = floorMat;

  // ── Back wall — architectural depth anchor ─────────────────────────────────
  // Very dark, nearly invisible. Its purpose is spatial: it tells the user
  // "the room ends here" so the 360 video reads as windows beyond the space,
  // not as the room itself. Alpha 0.28 — present but not dominant.
  const backWall = MeshBuilder.CreatePlane(
    "backWall",
    { width: 22, height: 6 },
    scene
  );
  backWall.position = new Vector3(0, 2.0, -11.0);
  backWall.isPickable = false;

  const backWallMat = new StandardMaterial("backWallMat", scene);
  backWallMat.diffuseColor = new Color3(er * 0.5, eg * 0.5, eb * 0.5);
  backWallMat.emissiveColor = new Color3(er * 0.12, eg * 0.12, eb * 0.12);
  backWallMat.disableLighting = true;
  backWallMat.backFaceCulling = false;
  backWallMat.alpha = 0.28;
  backWall.material = backWallMat;

  const disposables = [floor, backWall, floorMat, backWallMat];

  return {
    floor,
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}
