import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";

/**
 * Creates a Babylon.js Engine bound to a canvas.
 * Adaptive scaling + anti-aliasing on by default.
 * Must be called client-side only.
 */
export async function createEngine(canvas: HTMLCanvasElement): Promise<Engine> {
  const { Engine } = await import("@babylonjs/core/Engines/engine");
  const engine = new Engine(canvas, true, {
    adaptToDeviceRatio: true,
    antialias: true,
    stencil: true,
    powerPreference: "high-performance",
  });
  engine.enableOfflineSupport = false;
  return engine;
}

/**
 * Creates a Scene with a deterministic update/render loop.
 * skipPointerMovePicking is left false because we rely on pointer
 * observables in the interaction system.
 */
export async function createScene(engine: Engine): Promise<Scene> {
  const { Scene } = await import("@babylonjs/core/scene");

  // Side-effect imports that augment Scene with animation methods
  // (beginDirectAnimation, beginAnimation, etc.) and register the
  // GLB/GLTF loader needed by HolographicButton's mesh assets.
  await import("@babylonjs/core/Animations/animatable");
  await import("@babylonjs/loaders/glTF");

  const scene = new Scene(engine);
  scene.useRightHandedSystem = false;
  scene.autoClearDepthAndStencil = true;
  return scene;
}

/**
 * Starts the render loop and wires the engine resize handler.
 * Returns a cleanup function that stops the loop and removes the listener.
 */
export function startRenderLoop(engine: Engine, scene: Scene): () => void {
  engine.runRenderLoop(() => {
    if (scene.activeCamera) scene.render();
  });

  const onResize = () => engine.resize();
  window.addEventListener("resize", onResize);

  return () => {
    engine.stopRenderLoop();
    window.removeEventListener("resize", onResize);
  };
}
