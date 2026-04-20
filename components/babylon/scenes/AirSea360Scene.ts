import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import { DEFAULT_VIDEO_ID } from "@/content/airsea";

export interface AirSea360SceneHandle {
  scene: Scene;
  play(): void;
  pause(): void;
  setMuted(muted: boolean): void;
  dispose(): void;
}

export async function createAirSea360Scene(
  engine: Engine
): Promise<AirSea360SceneHandle> {
  const { Scene } = await import("@babylonjs/core/scene");
  await import("@babylonjs/core/Animations/animatable");
  await import("@babylonjs/loaders/glTF");

  const scene = new Scene(engine);

  const { UniversalCamera } = await import("@babylonjs/core/Cameras/universalCamera");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { Color4 } = await import("@babylonjs/core/Maths/math.color");

  scene.clearColor = new Color4(0, 0, 0, 1);

  const camera = new UniversalCamera("cam360", new Vector3(0, 0, 0), scene);
  camera.setTarget(new Vector3(0, 0, -1));
  camera.angularSensibility = 2000;
  camera.speed = 0;
  camera.minZ = 0.1;
  camera.maxZ = 200;
  camera.fov = 1.15;

  const { createMuxVideoSphere } = await import(
    "@/components/babylon/video/createMuxVideoSphere"
  );
  const videoSphere = await createMuxVideoSphere(scene, DEFAULT_VIDEO_ID);
  videoSphere.play();

  return {
    scene,
    play: () => videoSphere.play(),
    pause: () => videoSphere.pause(),
    setMuted: (muted) => videoSphere.setMuted(muted),
    dispose() {
      videoSphere.dispose();
      scene.dispose();
    },
  };
}
