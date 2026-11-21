// The heads-up display and the screens that sit over the game: the title, the scene-clear,
// game-over, victory and paused panels. Everything here is text and flat shapes on the
// game's own canvas, so the screenshots show exactly what a player sees.
import { COLORS, PANEL_LEFT, PANEL_RIGHT, VIEW } from './config.js';
import { SCENES } from './scenes.js';
import { rect, roundRect, text } from './draw.js';
import { remaining } from './differences.js';

/** The top bar: title, scene name, differences left, and score. */
export function drawTopBar(ctx, world) {
  const state = world.state;
  rect(ctx, 0, 0, VIEW.width, 64, COLORS.hud);
  rect(ctx, 0, 64, VIEW.width, 2, COLORS.hudLine);
  text(ctx, 'SPOT THE DIFFERENCE', 24, 34, 'bold 26px Georgia', COLORS.gold, 'left');
  text(ctx, 'The Curious Attic', 24, 54, 'italic 14px Georgia', COLORS.dim, 'left');
  const scene = SCENES[state.sceneIndex];
  roundRect(ctx, 470, 14, 340, 36, 18, '#2a2138');
  text(ctx, `${scene.name.toUpperCase()}  ·  SCENE ${state.sceneIndex + 1} OF ${SCENES.length}`, 640, 33, 'bold 16px Georgia', COLORS.ink);
  const left = remaining(scene, state.found).length;
  const counter = state.screen === 'win' ? 'ALL FOUND'
    : state.screen === 'clear' ? 'CLEAR!'
    : state.screen === 'title' ? `${scene.diffs.length} TO FIND`
    : `${left} LEFT`;
  roundRect(ctx, 830, 14, 130, 36, 18, state.screen === 'win' ? '#2e6b34' : left === 0 ? '#2e6b34' : '#7a2f28');
  text(ctx, counter, 895, 33, 'bold 18px Georgia', '#ffffff');
  text(ctx, `SCORE ${state.score}`, 1000, 33, 'bold 20px Georgia', COLORS.ink, 'left');
  text(ctx, `BEST ${state.best}`, 1140, 33, '16px Georgia', COLORS.dim, 'left');
}

/** The timer bar under the top bar: gold while there is time, red under 15 seconds. */
export function drawTimerBar(ctx, world) {
  const state = world.state;
  const scene = SCENES[state.sceneIndex];
  const frac = Math.max(0, state.timeLeft / scene.time);
  rect(ctx, 0, 66, VIEW.width, 10, '#0e0a16');
  const color = frac < 0.15 ? '#e4574d' : frac < 0.35 ? '#f2a541' : COLORS.gold;
  rect(ctx, 0, 66, VIEW.width * frac, 10, color);
  const secs = Math.ceil(state.timeLeft);
  text(ctx, `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, VIEW.width - 14, 92, 'bold 15px Georgia', color, 'right');
}

/** The bottom bar: the latest message, and the controls. */
export function drawBottomBar(ctx, world) {
  const state = world.state;
  rect(ctx, 0, 748, VIEW.width, 52, COLORS.hud);
  rect(ctx, 0, 748, VIEW.width, 2, COLORS.hudLine);
  const msg = state.messageTime > 0 ? state.message : 'Click a difference — or move the cursor with the arrow keys';
  text(ctx, msg, 24, 774, '16px Georgia', COLORS.ink, 'left');
  text(ctx, 'H hint   ·   P pause   ·   R restart   ·   1-3 scenes', VIEW.width - 24, 774, '14px Georgia', COLORS.dim, 'right');
}

/** A dark veil over the panels, for the screens that sit on top of them. */
function veil(ctx, alpha = 0.72) {
  ctx.fillStyle = `rgba(10,7,16,${alpha})`;
  ctx.fillRect(0, 76, VIEW.width, 672);
}

/** A centred panel with a title and lines of text. */
function panel(ctx, x, y, w, h, title, titleColor) {
  roundRect(ctx, x, y, w, h, 16, '#241d33');
  ctx.strokeStyle = COLORS.hudLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.stroke();
  text(ctx, title, VIEW.width / 2, y + 44, 'bold 34px Georgia', titleColor);
}

export function drawTitle(ctx, world) {
  const state = world.state;
  veil(ctx, 0.45);
  panel(ctx, 290, 170, 700, 440, 'SPOT THE DIFFERENCE', COLORS.gold);
  text(ctx, 'The Curious Attic', 640, 252, 'italic 22px Georgia', COLORS.ink);
  text(ctx, 'Two pictures hang side by side. They look the same —', 640, 310, '18px Georgia', COLORS.dim);
  text(ctx, 'they are not. Find every difference before the clock runs out.', 640, 338, '18px Georgia', COLORS.dim);
  text(ctx, 'Three rooms, 5 then 7 then 9 differences. Wrong clicks cost 10 points.', 640, 380, '16px Georgia', COLORS.dim);
  text(ctx, 'Click a difference, or move the cursor with the arrow keys and press Enter.', 640, 408, '16px Georgia', COLORS.dim);
  text(ctx, 'H asks for a hint · P pauses · 1, 2, 3 jump to a room', 640, 436, '16px Georgia', COLORS.dim);
  roundRect(ctx, 470, 470, 340, 56, 12, COLORS.gold);
  text(ctx, 'CLICK OR PRESS ENTER TO PLAY', 640, 499, 'bold 17px Georgia', '#241d33');
  if (state.best > 0) text(ctx, `Best score so far: ${state.best}`, 640, 560, '16px Georgia', COLORS.gold);
  text(ctx, '1  The Attic     2  The Garden Shed     3  The Night Market', 640, 590, '15px Georgia', COLORS.dim);
}

export function drawClear(ctx, world) {
  const state = world.state;
  const scene = SCENES[state.sceneIndex];
  const cleared = state.cleared[state.cleared.length - 1];
  veil(ctx, 0.55);
  panel(ctx, 340, 220, 600, 330, 'SCENE CLEAR!', COLORS.green);
  text(ctx, `${scene.name} — all ${scene.diffs.length} differences found`, 640, 300, '19px Georgia', COLORS.ink);
  text(ctx, `Time bonus +${cleared ? cleared.bonus : 0}   ·   Score ${state.score}`, 640, 344, '18px Georgia', COLORS.gold);
  const next = SCENES[state.sceneIndex + 1];
  if (next) text(ctx, `Next: ${next.name} — ${next.diffs.length} differences, ${next.time}s on the clock`, 640, 392, '17px Georgia', COLORS.dim);
  roundRect(ctx, 480, 440, 320, 52, 12, COLORS.gold);
  text(ctx, 'PRESS N OR CLICK FOR THE NEXT ROOM', 640, 467, 'bold 15px Georgia', '#241d33');
}

export function drawOver(ctx, world) {
  const state = world.state;
  const scene = SCENES[state.sceneIndex];
  const left = remaining(scene, state.found).length;
  veil(ctx, 0.6);
  panel(ctx, 340, 220, 600, 340, "TIME'S UP", COLORS.red);
  text(ctx, `${scene.name} — ${left} difference${left === 1 ? '' : 's'} still hiding`, 640, 300, '19px Georgia', COLORS.ink);
  text(ctx, `You found ${state.totalFound} differences in all   ·   Score ${state.score}`, 640, 344, '18px Georgia', COLORS.gold);
  if (state.best > 0) text(ctx, `Best score: ${state.best}`, 640, 388, '17px Georgia', COLORS.dim);
  roundRect(ctx, 480, 440, 320, 52, 12, COLORS.gold);
  text(ctx, 'PRESS R OR CLICK TO TRY AGAIN', 640, 467, 'bold 15px Georgia', '#241d33');
}

export function drawWin(ctx, world) {
  const state = world.state;
  veil(ctx, 0.55);
  panel(ctx, 290, 180, 700, 420, 'YOU FOUND THEM ALL!', COLORS.gold);
  text(ctx, 'Every difference in all three rooms — the attic keeps no secrets now.', 640, 262, '19px Georgia', COLORS.ink);
  text(ctx, `Final score ${state.score}   ·   ${state.totalFound} differences found`, 640, 306, '20px Georgia', COLORS.gold);
  const lines = state.cleared.map((c) => `${SCENES[c.scene].name}: cleared with ${c.timeLeft}s left (+${c.bonus})`);
  lines.forEach((line, i) => text(ctx, line, 640, 350 + i * 28, '16px Georgia', COLORS.dim));
  text(ctx, `Wrong clicks: ${state.misses}`, 640, 350 + lines.length * 28 + 8, '16px Georgia', COLORS.dim);
  roundRect(ctx, 480, 500, 320, 52, 12, COLORS.gold);
  text(ctx, 'PRESS R OR CLICK TO PLAY AGAIN', 640, 527, 'bold 15px Georgia', '#241d33');
}

export function drawPaused(ctx) {
  veil(ctx, 0.6);
  panel(ctx, 390, 280, 500, 200, 'PAUSED', COLORS.ink);
  text(ctx, 'The clock is stopped. Press P to carry on.', 640, 360, '18px Georgia', COLORS.dim);
  text(ctx, 'R restarts the game from the first room.', 640, 396, '16px Georgia', COLORS.dim);
}
