import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { VideoTexture } from "@babylonjs/core/Materials/Textures/videoTexture";
import type { ManagedVideoElement } from "@/lib/mux/muxVideo";

/**
 * ─── 360 Video Sphere Design Rationale ────────────────────────────────────────
 *
 * The sphere has:
 *   - Radius 50: large enough that the camera (at origin) always feels inside.
 *   - Side Orientation BACKSIDE: renders only the inner surface so the texture
 *     faces inward toward the camera.
 *   - 64×32 subdivisions: sufficient for equirectangular video quality without
 *     excessive vertex count.
 *   - Rotation around Y by Math.PI: aligns the equirectangular seam away from
 *     the primary view direction (which faces -Z by default).
 *
 * VideoTexture wraps the managed HTMLVideoElement. We pass
 * `independentVideoSource: true` so Babylon does NOT attempt to call
 * video.play() — playback control lives entirely in the store / interaction
 * system to avoid double-play race conditions.
 *
 * The sphere is NOT pickable. It must not interfere with the pointer-picking
 * system used by the interaction layer — picking against a giant sphere would
 * always "win" and swallow events.
 */

export interface MuxVideoSphere {
  sphere: Mesh;
  texture: VideoTexture;
  managed: ManagedVideoElement;
  setPlaybackId(playbackId: string): Promise<void>;
  play(): void;
  pause(): void;
  setMuted(muted: boolean): void;
  dispose(): void;
}

export async function createMuxVideoSphere(
  scene: Scene,
  playbackId: string
): Promise<MuxVideoSphere> {
  const { MeshBuilder } = await import("@babylonjs/core/Meshes/meshBuilder");
  const { Mesh } = await import("@babylonjs/core/Meshes/mesh");
  const { StandardMaterial } = await import("@babylonjs/core/Materials/standardMaterial");
  const { VideoTexture } = await import("@babylonjs/core/Materials/Textures/videoTexture");
  const { createMuxVideoElement } = await import("@/lib/mux/muxVideo");

  const managed = await createMuxVideoElement(playbackId, {
    muted: true,
    loop: true,
    autoplay: true,
  });

  const sphere = MeshBuilder.CreateSphere(
    "videoSphere",
    {
      diameter: 100,
      segments: 64,
      sideOrientation: Mesh.BACKSIDE,
    },
    scene
  );

  // Align equirectangular seam away from primary -Z view direction
  sphere.rotation.y = Math.PI;
  sphere.isPickable = false;
  sphere.infiniteDistance = false;

  const texture = new VideoTexture(
    "muxVideoTex",
    managed.video,
    scene,
    false,    // no mip maps
    true,     // invertY = true — WebGL Y-flip needed for equirectangular video
    undefined,
    {
      autoUpdateTexture: true,
      independentVideoSource: true, // we control playback manually
      loop: true,
      muted: true,
    }
  );

  const mat = new StandardMaterial("videoSphereMat", scene);
  mat.diffuseTexture = texture;
  mat.backFaceCulling = false;
  mat.emissiveTexture = texture; // unlit — video should be full-bright
  mat.disableLighting = true;
  sphere.material = mat;

  const play = () => {
    managed.video.play().catch(() => {
      // Deferred until next user gesture if autoplay is blocked
    });
  };

  const pause = () => {
    managed.video.pause();
  };

  const setMuted = (muted: boolean) => {
    managed.video.muted = muted;
  };

  const setPlaybackId = async (newPlaybackId: string): Promise<void> => {
    managed.video.pause();
    const { getMuxHlsUrl } = await import("@/lib/mux/muxVideo");
    const canPlayNative = managed.video.canPlayType("application/vnd.apple.mpegurl");
    if (canPlayNative) {
      managed.video.src = getMuxHlsUrl(newPlaybackId);
      managed.video.load();
      play();
    }
    // For hls.js sessions, the caller should dispose and recreate the sphere.
    // Switching HLS sources mid-session is complex and out of scope for v1.
  };

  return {
    sphere,
    texture,
    managed,
    setPlaybackId,
    play,
    pause,
    setMuted,
    dispose() {
      scene.stopAnimation(sphere);
      texture.dispose();
      mat.dispose();
      sphere.dispose();
      managed.dispose();
    },
  };
}
