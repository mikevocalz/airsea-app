import type { Scene } from "@babylonjs/core/scene";
import type { AirSeaVideo } from "@/content/videos";
import { BRAND } from "@/lib/brand/tokens";

/**
 * Single-plane card per video.
 * ADT handles both thumbnail (GuiImage, stretch=UNIFORM_TO_FILL) and text.
 * Action manager lives on the same mesh — no second plane to block picks.
 *
 * Layout: 3 cols × 2 rows at Z = +4.8
 *   Camera at z=0 faces +Z → plane front faces (normal -Z) face the camera.
 */

const CARD_W = 1.25;
const CARD_H = 0.703;
const COL_X  = [-1.55, 0, 1.55] as const;
const ROW_Y  = [2.15, 1.17] as const;
const Z      = 4.8;

export interface GalleryCards {
  dispose(): void;
}

export async function createGalleryCards(
  scene: Scene,
  videos: AirSeaVideo[],
  onSelect: (videoId: string) => void
): Promise<GalleryCards> {
  const { MeshBuilder }       = await import("@babylonjs/core/Meshes/meshBuilder");
  const { Color3 }            = await import("@babylonjs/core/Maths/math.color");
  const { Vector3 }           = await import("@babylonjs/core/Maths/math.vector");
  const { ActionManager }     = await import("@babylonjs/core/Actions/actionManager");
  const { ExecuteCodeAction } = await import("@babylonjs/core/Actions/directActions");
  const { AdvancedDynamicTexture } = await import("@babylonjs/gui/2D/advancedDynamicTexture");
  const { Rectangle }         = await import("@babylonjs/gui/2D/controls/rectangle");
  const { TextBlock }         = await import("@babylonjs/gui/2D/controls/textBlock");
  const { Control }           = await import("@babylonjs/gui/2D/controls/control");
  const { Image: GuiImage }   = await import("@babylonjs/gui/2D/controls/image");
  await import("@babylonjs/core/Rendering/outlineRenderer");

  const tealColor = Color3.FromHexString(BRAND.teal);
  const sorted    = [...videos].sort((a, b) => a.sortOrder - b.sortOrder);
  const disposables: { dispose(): void }[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const video = sorted[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x   = COL_X[col];
    const y   = row < ROW_Y.length
      ? ROW_Y[row]
      : ROW_Y[ROW_Y.length - 1] - (row - ROW_Y.length + 1) * (CARD_H + 0.25);

    const mesh = MeshBuilder.CreatePlane(`card_${video.id}`, {
      width: CARD_W, height: CARD_H,
    }, scene);
    mesh.position = new Vector3(x, y, Z);

    // 1280×720 gives 2× pixel density vs the old 640×360 — text renders crisply
    const adt = AdvancedDynamicTexture.CreateForMesh(mesh, 1280, 720, false);

    // ── Dark base ──────────────────────────────────────────────────────
    const bg = new Rectangle(`bg_${video.id}`);
    bg.width      = "100%";
    bg.height     = "100%";
    bg.background = "#0C1018";
    bg.thickness  = 0;
    adt.addControl(bg);

    // ── Thumbnail ──────────────────────────────────────────────────────
    if (!video.comingSoon && video.playbackId) {
      const thumbUrl = `https://image.mux.com/${video.playbackId}/thumbnail.png?width=214&height=121&time=${video.thumbnailTime ?? 15}`;
      const thumb = new GuiImage(`thumb_${video.id}`, thumbUrl);
      thumb.width   = "100%";
      thumb.height  = "100%";
      thumb.stretch = 3; // STRETCH_UNIFORM_TO_FILL
      adt.addControl(thumb);
    }

    // ── Top scrim (category label readability) ─────────────────────────
    const topScrim = new Rectangle(`topScrim_${video.id}`);
    topScrim.width  = "100%";
    topScrim.height = "22%";
    topScrim.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    topScrim.background = "rgba(5,7,9,0.72)";
    topScrim.thickness  = 0;
    adt.addControl(topScrim);

    // ── Bottom scrim — two rects approximate a gradient ────────────────
    const scrimHeavy = new Rectangle(`scrimH_${video.id}`);
    scrimHeavy.width  = "100%";
    scrimHeavy.height = "42%";
    scrimHeavy.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    scrimHeavy.background = "rgba(5,7,9,0.93)";
    scrimHeavy.thickness  = 0;
    adt.addControl(scrimHeavy);

    const scrimMid = new Rectangle(`scrimM_${video.id}`);
    scrimMid.width  = "100%";
    scrimMid.height = "28%";
    scrimMid.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    scrimMid.top        = "-42%";
    scrimMid.background = "rgba(5,7,9,0.42)";
    scrimMid.thickness  = 0;
    adt.addControl(scrimMid);

    // ── Teal accent line ───────────────────────────────────────────────
    const topBar = new Rectangle(`topBar_${video.id}`);
    topBar.width  = "100%";
    topBar.height = "4px";
    topBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    topBar.background = BRAND.teal;
    topBar.thickness  = 0;
    adt.addControl(topBar);

    // ── Category — top-left ────────────────────────────────────────────
    const catLabel = new TextBlock(`cat_${video.id}`, video.category.toUpperCase());
    catLabel.color      = BRAND.teal;
    catLabel.fontSize   = 24;
    catLabel.fontFamily = "Arial, sans-serif";
    catLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    catLabel.textVerticalAlignment   = Control.VERTICAL_ALIGNMENT_TOP;
    catLabel.verticalAlignment   = Control.VERTICAL_ALIGNMENT_TOP;
    catLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    catLabel.paddingTop  = "26px";
    catLabel.paddingLeft = "30px";
    catLabel.height = "56px";
    catLabel.width  = "72%";
    adt.addControl(catLabel);

    // ── Title — bottom-left ────────────────────────────────────────────
    const titleLabel = new TextBlock(`title_${video.id}`, video.title);
    titleLabel.color      = BRAND.textPrimary;
    titleLabel.fontSize   = 52;
    titleLabel.fontFamily = "Georgia, serif";
    titleLabel.fontWeight = "300";
    titleLabel.textWrapping = true;
    titleLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    titleLabel.textVerticalAlignment   = Control.VERTICAL_ALIGNMENT_BOTTOM;
    titleLabel.verticalAlignment   = Control.VERTICAL_ALIGNMENT_BOTTOM;
    titleLabel.paddingBottom = "34px";
    titleLabel.paddingLeft   = "30px";
    titleLabel.paddingRight  = "30px";
    titleLabel.height = "46%";
    titleLabel.width  = "100%";
    adt.addControl(titleLabel);

    // ── Description — above title ──────────────────────────────────────
    const descLabel = new TextBlock(`desc_${video.id}`, video.description);
    descLabel.color      = BRAND.textSecondary;
    descLabel.fontSize   = 28;
    descLabel.fontFamily = "Arial, sans-serif";
    descLabel.textWrapping = true;
    descLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    descLabel.textVerticalAlignment   = Control.VERTICAL_ALIGNMENT_BOTTOM;
    descLabel.verticalAlignment   = Control.VERTICAL_ALIGNMENT_BOTTOM;
    descLabel.paddingBottom = "120px";
    descLabel.paddingLeft   = "30px";
    descLabel.paddingRight  = "30px";
    descLabel.height = "22%";
    descLabel.width  = "100%";
    adt.addControl(descLabel);

    if (!video.comingSoon) {
      // ── 360° badge — top-right ─────────────────────────────────────
      const badge = new TextBlock(`badge_${video.id}`, "360°");
      badge.color      = BRAND.teal;
      badge.fontSize   = 24;
      badge.fontFamily = "Arial, sans-serif";
      badge.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      badge.textVerticalAlignment   = Control.VERTICAL_ALIGNMENT_TOP;
      badge.verticalAlignment   = Control.VERTICAL_ALIGNMENT_TOP;
      badge.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      badge.paddingTop   = "26px";
      badge.paddingRight = "30px";
      badge.height = "56px";
      badge.width  = "28%";
      adt.addControl(badge);

      // ── Hover outline + pick ───────────────────────────────────────
      mesh.outlineColor  = tealColor;
      mesh.outlineWidth  = 0.03;
      mesh.renderOutline = false;

      mesh.actionManager = new ActionManager(scene);
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
          mesh.renderOutline = true;
        })
      );
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
          mesh.renderOutline = false;
        })
      );
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, () => onSelect(video.id))
      );
    } else {
      // ── Coming-soon overlay ────────────────────────────────────────
      const dimRect = new Rectangle(`dim_${video.id}`);
      dimRect.width      = "100%";
      dimRect.height     = "100%";
      dimRect.background = "rgba(0,0,0,0.55)";
      dimRect.thickness  = 0;
      adt.addControl(dimRect);

      const csLabel = new TextBlock(`cs_${video.id}`, "COMING SOON");
      csLabel.color      = "rgba(232,232,230,0.40)";
      csLabel.fontSize   = 32;
      csLabel.fontFamily = "Arial, sans-serif";
      adt.addControl(csLabel);
    }

    disposables.push(adt);
    disposables.push({ dispose: () => mesh.dispose() });
  }

  return {
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}
