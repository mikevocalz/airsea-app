import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";

import { AIRSEA_VIDEOS } from "@/content/videos";
import { useVideoStore } from "@/store/useVideoStore";

export interface VideoGallerySceneHandle {
  scene: Scene;
  dispose(): void;
}

export async function createVideoGalleryScene(
  engine: Engine,
  _canvas: HTMLCanvasElement
): Promise<VideoGallerySceneHandle> {
  const { createScene } = await import("@/lib/babylon/engineFactory");
  const scene = await createScene(engine);

  const { Color4, Color3 } = await import("@babylonjs/core/Maths/math.color");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { UniversalCamera } = await import("@babylonjs/core/Cameras/universalCamera");
  const { HemisphericLight } = await import("@babylonjs/core/Lights/hemisphericLight");

  scene.clearColor = new Color4(0.043, 0.051, 0.063, 1);
  scene.fogMode = 2; // FOGMODE_EXP2
  scene.fogDensity = 0.04;
  scene.fogColor = new Color3(0.043, 0.051, 0.063);

  // Locked camera — gallery is not draggable, cards handle navigation
  // Camera faces +Z so plane front faces (normal -Z) face the camera — no UV hacks needed.
  const camera = new UniversalCamera("galleryCam", new Vector3(0, 1.6, 0), scene);
  camera.setTarget(new Vector3(0, 1.6, 4.8));
  camera.minZ = 0.1;
  camera.maxZ = 60;
  scene.activeCamera = camera;

  const light = new HemisphericLight("galleryLight", new Vector3(0, 1, 0), scene);
  light.intensity = 0.35;
  light.diffuse = new Color3(0.6, 0.8, 0.9);
  light.specular = new Color3(0, 0, 0);

  const { createGalleryCards } = await import(
    "@/components/babylon/gui/createGalleryCards"
  );
  const cards = await createGalleryCards(scene, AIRSEA_VIDEOS, (videoId) => {
    useVideoStore.getState().selectVideo(videoId);
  });

  useVideoStore.getState().setSceneReady(true);

  return {
    scene,
    dispose() {
      cards.dispose();
      scene.dispose();
      useVideoStore.getState().setSceneReady(false);
    },
  };
}
