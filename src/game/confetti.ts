// ============================================================================
// confetti.ts  —  a short celebratory burst of ~30 colored quads at the report.
// Works in the browser and the headset (it is real 3D, not a DOM overlay). One
// self-terminating loop animates the pieces falling and spinning, then disposes
// them so nothing lingers.
// ============================================================================

import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
} from "@iwsdk/core";
import type { World } from "@iwsdk/core";

const CONFETTI_COLORS = ["#5fae4a", "#4a8fd6", "#c8962a", "#a33b2a", "#ffffff"];
const PIECES = 32;

export function burstConfetti(world: World, center: Vector3) {
  const geo = new PlaneGeometry(0.09, 0.09);
  const pieces: Array<{ entity: ReturnType<World["createTransformEntity"]>; vel: Vector3; spin: number }> = [];

  for (let i = 0; i < PIECES; i = i + 1) {
    const mat = new MeshBasicMaterial({
      color: new Color(CONFETTI_COLORS[i % CONFETTI_COLORS.length]),
      side: DoubleSide,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new Mesh(geo, mat);
    const entity = world.createTransformEntity(mesh, { parent: world.sceneEntity });
    const o3d = entity.object3D!;
    o3d.position.copy(center);
    o3d.position.x += (i % 8) * 0.06 - 0.24; // spread the launch across the panel
    // Burst up and out, then gravity pulls it back down.
    const vel = new Vector3((Math.random() - 0.5) * 1.4, 1.6 + Math.random() * 1.2, (Math.random() - 0.5) * 1.4);
    pieces.push({ entity, vel, spin: (Math.random() - 0.5) * 12 });
  }

  const GRAVITY = -3.2;
  const STEP = 0.033;
  let elapsed = 0;
  const timer = setInterval(function () {
    elapsed = elapsed + STEP;
    for (const p of pieces) {
      const o3d = p.entity.object3D;
      if (!o3d) continue;
      p.vel.y = p.vel.y + GRAVITY * STEP;
      o3d.position.x += p.vel.x * STEP;
      o3d.position.y += p.vel.y * STEP;
      o3d.position.z += p.vel.z * STEP;
      o3d.rotation.z += p.spin * STEP;
      o3d.rotation.x += p.spin * STEP * 0.6;
    }
    if (elapsed >= 2.6) {
      clearInterval(timer);
      for (const p of pieces) p.entity.dispose(); // free the meshes + GPU resources
    }
  }, 33);
}
