// Finding differences: hit testing a click against a scene's difference regions, and the
// markers drawn on both pictures once a difference is found.
import { circle, ring } from './draw.js';
import { HIT_RADIUS } from './config.js';

/**
 * The difference a point (panel-local x, y) lands on, or null. A click counts when it falls
 * within a difference's own radius, or the generous HIT_RADIUS, whichever is larger.
 */
export function differenceAt(scene, x, y) {
  for (let i = 0; i < scene.diffs.length; i += 1) {
    const d = scene.diffs[i];
    const dx = x - d.x;
    const dy = y - d.y;
    const reach = Math.max(d.r, HIT_RADIUS);
    if (dx * dx + dy * dy <= reach * reach) return d;
  }
  return null;
}

/** The differences of a scene that are not in `found` (a Set of difference ids). */
export function remaining(scene, found) {
  return scene.diffs.filter((d) => !found.has(d.id));
}

/** Draw the found markers on one panel: a gold ring and a check over each found difference. */
export function drawFoundMarkers(ctx, scene, found, time) {
  for (let i = 0; i < scene.diffs.length; i += 1) {
    const d = scene.diffs[i];
    if (!found.has(d.id)) continue;
    const pulse = 1 + Math.sin(time * 3 + i) * 0.06;
    ring(ctx, d.x, d.y, d.r * pulse, '#f2c14e', 5);
    ring(ctx, d.x, d.y, d.r * pulse + 6, 'rgba(242,193,78,0.45)', 2);
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(d.x - 12, d.y);
    ctx.lineTo(d.x - 3, d.y + 10);
    ctx.lineTo(d.x + 14, d.y - 11);
    ctx.stroke();
  }
}

/** Draw the hint's pulsing ring over one difference, fading with `alpha` 0..1. */
export function drawHintRing(ctx, diff, time, alpha) {
  const r = diff.r + 6 + Math.sin(time * 6) * 5;
  ctx.save();
  ctx.globalAlpha = alpha;
  ring(ctx, diff.x, diff.y, r, '#7ec850', 5);
  ctx.restore();
}

/** Draw a small red X where a wrong click landed, fading with `alpha` 0..1. */
export function drawMissMark(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#e4574d';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12);
  ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
  ctx.restore();
}

/** A soft gold glow behind a difference, used on the victory screen. */
export function drawGlow(ctx, diff) {
  circle(ctx, diff.x, diff.y, diff.r + 10, 'rgba(242,193,78,0.18)');
}
