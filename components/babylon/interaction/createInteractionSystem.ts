import type { Scene } from "@babylonjs/core/scene";
import type { IInteractable } from "@/types/experience";

/**
 * ─── Interaction System Design ────────────────────────────────────────────────
 *
 * This module implements a desktop pointer-based interaction system that is
 * structurally identical to what a WebXR controller system would produce.
 *
 * Desktop now:
 *   - Babylon's PointerObservable fires pointer events from mouse/touch input.
 *   - We normalise them into InteractionEvents and dispatch to registered
 *     IInteractable targets by mesh name.
 *
 * WebXR later:
 *   - Replace/augment the PointerObservable wiring with WebXRInputSource
 *     observables from scene.xrManager (Babylon's built-in XR helper).
 *   - The same IInteractable registry accepts exactly the same InteractionEvent
 *     shape — zero changes to any consuming system.
 *   - Gaze/dwell interaction can be layered as another event source that calls
 *     the same dispatch function.
 *
 * Hover state is tracked per-mesh so pointer-out fires correctly even if the
 * pointer leaves the canvas entirely (handled via scene.onPointerObservable
 * with POINTERMOVE where pickedMesh becomes null).
 */

import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

interface RegisteredInteractable {
  interactable: IInteractable;
  mesh: AbstractMesh;
}

export interface InteractionSystem {
  register(mesh: AbstractMesh, interactable: IInteractable): void;
  unregister(id: string): void;
  dispose(): void;
}

export async function createInteractionSystem(scene: Scene): Promise<InteractionSystem> {
  const { PointerEventTypes } = await import("@babylonjs/core/Events/pointerEvents");

  const registry = new Map<string, RegisteredInteractable>();
  let hoveredId: string | null = null;

  const dispatch = (id: string, type: "enter" | "leave" | "down" | "up" | "click") => {
    const entry = registry.get(id);
    if (entry) {
      entry.interactable.onInteraction({ type, targetId: id });
    }
  };

  const pointerObserver = scene.onPointerObservable.add((pointerInfo) => {
    const picked = pointerInfo.pickInfo?.pickedMesh;

    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERMOVE: {
        const newId = picked ? picked.name : null;
        const registeredId = newId && registry.has(newId) ? newId : null;

        if (hoveredId && hoveredId !== registeredId) {
          dispatch(hoveredId, "leave");
          hoveredId = null;
        }
        if (registeredId && registeredId !== hoveredId) {
          hoveredId = registeredId;
          dispatch(registeredId, "enter");
        }
        break;
      }

      case PointerEventTypes.POINTERDOWN: {
        if (picked && registry.has(picked.name)) {
          dispatch(picked.name, "down");
        }
        break;
      }

      case PointerEventTypes.POINTERUP: {
        if (picked && registry.has(picked.name)) {
          dispatch(picked.name, "up");
          dispatch(picked.name, "click");
        }
        break;
      }
    }
  });

  return {
    register(mesh, interactable) {
      registry.set(mesh.name, { interactable, mesh });
    },

    unregister(id) {
      registry.delete(id);
      if (hoveredId === id) hoveredId = null;
    },

    dispose() {
      scene.onPointerObservable.remove(pointerObserver);
      registry.clear();
    },
  };
}
