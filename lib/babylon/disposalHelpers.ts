import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

/**
 * Safely dispose a mesh, its material, and all active material textures.
 * Silently no-ops on null/already-disposed inputs.
 */
export function disposeMeshWithResources(mesh: AbstractMesh | null | undefined): void {
  if (!mesh) return;

  const mat = mesh.material;
  if (mat) {
    mat.getActiveTextures().forEach((t) => {
      try {
        t.dispose();
      } catch {
        // texture may have already been disposed
      }
    });
    mat.dispose();
  }

  mesh.dispose();
}

/**
 * Dispose an array of disposables, clearing the array afterwards.
 */
export function disposeAll(items: Array<{ dispose(): void } | null | undefined>): void {
  for (const item of items) {
    try {
      item?.dispose();
    } catch {
      // Defensive: already disposed objects may throw
    }
  }
  items.length = 0;
}

/**
 * Remove all meshes and materials from a scene segment by name.
 */
export function disposeSceneSegment(
  scene: Scene,
  meshNames: string[],
  materialNames: string[]
): void {
  meshNames.forEach((name) => {
    const mesh = scene.getMeshByName(name);
    if (mesh) disposeMeshWithResources(mesh);
  });

  materialNames.forEach((name) => {
    const mat = scene.getMaterialByName(name);
    mat?.dispose();
  });
}
