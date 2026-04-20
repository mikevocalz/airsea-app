import type { Scene } from "@babylonjs/core/scene";
import type { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { BRAND, hexToFloat3 } from "@/lib/brand/tokens";

/**
 * ─── Transport Controls — play/pause + mute ───────────────────────────────────
 *
 * Position: (1.3, 0.88, -2.6) — right peripheral, "reach" depth band.
 *   X=+1.3: peripheral right — utility, not primary attention.
 *   Y=0.88: matches nav bar height — unified lower control row.
 *   Z=−2.6: 1.6m in front of the nav bar — clearly a different plane.
 * StackPanel3D(false) = horizontal layout.
 */

export interface TransportControls {
  setPlaying(playing: boolean): void;
  setMuted(muted: boolean): void;
  dispose(): void;
}

export async function createTransportControls3D(
  scene: Scene,
  manager: GUI3DManager,
  opts: {
    onPlayPause: () => void;
    onMuteToggle: () => void;
    initialPlaying: boolean;
    initialMuted: boolean;
  }
): Promise<TransportControls> {
  const { StackPanel3D } = await import("@babylonjs/gui/3D/controls/stackPanel3D");
  const { HolographicButton } = await import("@babylonjs/gui/3D/controls/holographicButton");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { Color3 } = await import("@babylonjs/core/Maths/math.color");

  const [tr, tg, tb] = hexToFloat3(BRAND.teal);
  const [pr, pg, pb] = hexToFloat3(BRAND.panel);

  const stack = new StackPanel3D(false);
  stack.margin = 0.04;

  manager.addControl(stack);
  stack.position = new Vector3(1.3, 0.88, -2.6);

  const makeBtn = (name: string, label: string) => {
    const btn = new HolographicButton(name);
    btn.scaling = new Vector3(0.25, 0.25, 0.25);
    btn.text = label;

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
        btn.backMaterial.albedoColor = new Color3(pr, pg, pb);
      }
    };

    return btn;
  };

  const playBtn = makeBtn("playPauseBtn", opts.initialPlaying ? "\u23F8" : "\u25B6");
  playBtn.onPointerClickObservable.add(() => opts.onPlayPause());
  stack.addControl(playBtn);

  const muteBtn = makeBtn("muteBtn", opts.initialMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A");
  muteBtn.onPointerClickObservable.add(() => opts.onMuteToggle());
  stack.addControl(muteBtn);

  return {
    setPlaying(playing) {
      playBtn.text = playing ? "\u23F8" : "\u25B6";
    },
    setMuted(muted) {
      muteBtn.text = muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
    },
    dispose() {
      stack.dispose();
    },
  };
}
