// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is
// there. The game moves between six screens: title, play, scene clear, game over, win
// and paused.
//
// ?seed=N fixes nothing random in this game (the scenes are drawn, not random), but is
// accepted for the screenshots. ?shot=start|play|end (with &seed=N) stages that scene
// instead of running the loop, paints it twice and sets window.__shotReady for a
// screenshot.
import { COLORS, PANEL_LEFT, PANEL_RIGHT, STEP, VIEW } from './config.js';
import { createWorld, SCREEN_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';
import { createInput, ACTION_HINT, ACTION_NEXT, ACTION_PAUSE, ACTION_RESTART } from './input.js';
import { drawBottomBar, drawClear, drawOver, drawPaused, drawTimerBar, drawTitle, drawTopBar, drawWin } from './hud.js';
import { drawFoundMarkers, drawHintRing, drawMissMark } from './differences.js';
import { rect, ring, text } from './draw.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
const world = createWorld();
const input = createInput(canvas, {
  onPointer(x, y, panel) {
    const state = world.state;
    if (state.screen === SCREEN_TITLE) world.startGame();
    else if (state.screen === SCREEN_CLEAR) world.nextScene();
    else if (state.screen === SCREEN_OVER || state.screen === SCREEN_WIN) world.startGame();
    else if (state.screen === SCREEN_PAUSED) world.togglePause();
    else if (state.screen === SCREEN_PLAY) world.clickAt(x, y, panel);
  },
  onOutside() {
    const state = world.state;
    if (state.screen === SCREEN_TITLE) world.startGame();
    else if (state.screen === SCREEN_CLEAR) world.nextScene();
    else if (state.screen === SCREEN_OVER || state.screen === SCREEN_WIN) world.startGame();
    else if (state.screen === SCREEN_PAUSED) world.togglePause();
  },
  onMove() {},
  onKey(action) {
    const state = world.state;
    if (action === ACTION_HINT) world.useHint();
    else if (action === ACTION_PAUSE) world.togglePause();
    else if (action === ACTION_RESTART) world.startGame();
    else if (action === ACTION_NEXT) {
      if (state.screen === SCREEN_CLEAR) world.nextScene();
    }
  },
  onSceneKey(index) {
    if (world.state.screen === SCREEN_TITLE) {
      world.startGame();
      world.startScene(index);
    }
  },
});

/** Fit the fixed logical playfield into the window, keeping its shape. */
function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  const w = Math.floor(VIEW.width * scale);
  const h = Math.floor(VIEW.height * scale);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.style.left = `${Math.floor((window.innerWidth - w) / 2)}px`;
  canvas.style.top = `${Math.floor((window.innerHeight - h) / 2)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

/** Announce screen changes and finds for screen readers (and anyone reading the page text). */
function announce(message) {
  status.textContent = message;
}
let lastAnnounced = '';
function announceScreen() {
  const state = world.state;
  const scene = world.scene();
  let message = '';
  if (state.screen === SCREEN_TITLE) message = 'Spot the Difference: The Curious Attic. Title screen.';
  else if (state.screen === SCREEN_PLAY) message = `${scene.name}. ${scene.diffs.length - state.found.size} differences left.`;
  else if (state.screen === SCREEN_CLEAR) message = `Scene clear. ${scene.name} complete.`;
  else if (state.screen === SCREEN_OVER) message = "Time's up. Game over.";
  else if (state.screen === SCREEN_WIN) message = 'You found them all. You win.';
  else if (state.screen === SCREEN_PAUSED) message = 'Paused.';
  if (message && message !== lastAnnounced) {
    lastAnnounced = message;
    announce(message);
  }
}

/** Draw one picture panel: the scene in its variant, then the found markers. */
function drawPanel(panel, variant, time) {
  const state = world.state;
  const scene = world.scene();
  ctx.save();
  ctx.beginPath();
  ctx.rect(panel.x, panel.y, panel.w, panel.h);
  ctx.clip();
  ctx.translate(panel.x, panel.y);
  scene.draw(ctx, variant);
  drawFoundMarkers(ctx, scene, state.found, time);
  if (state.hintTarget && state.hintTime > 0) {
    drawHintRing(ctx, state.hintTarget, time, Math.min(1, state.hintTime));
  }
  for (const mark of state.missMarks) {
    if (mark.panel === (variant === 0 ? 0 : 1)) {
      drawMissMark(ctx, mark.x, mark.y, Math.min(1, mark.t));
    }
  }
  ctx.restore();
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
}

/** The whole frame: background, panels, labels, HUD, cursor and the screen over the top. */
function render(time) {
  const state = world.state;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  rect(ctx, 0, 0, VIEW.width, VIEW.height, COLORS.page);
  const scene = world.scene();
  text(ctx, 'PICTURE A', PANEL_LEFT.x + PANEL_LEFT.w / 2, 88, 'bold 15px Georgia', COLORS.dim);
  text(ctx, 'PICTURE B', PANEL_RIGHT.x + PANEL_RIGHT.w / 2, 88, 'bold 15px Georgia', COLORS.dim);
  drawPanel(PANEL_LEFT, 0, time);
  drawPanel(PANEL_RIGHT, 1, time);
  drawTopBar(ctx, world);
  drawTimerBar(ctx, world);
  drawBottomBar(ctx, world);
  // The keyboard/mouse cursor: a small crosshair, only while playing.
  if (state.screen === SCREEN_PLAY) {
    const cursor = input.getCursor();
    ring(ctx, cursor.x, cursor.y, 14, 'rgba(245,239,224,0.9)', 2);
    ctx.strokeStyle = 'rgba(245,239,224,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursor.x - 20, cursor.y);
    ctx.lineTo(cursor.x - 8, cursor.y);
    ctx.moveTo(cursor.x + 8, cursor.y);
    ctx.lineTo(cursor.x + 20, cursor.y);
    ctx.moveTo(cursor.x, cursor.y - 20);
    ctx.lineTo(cursor.x, cursor.y - 8);
    ctx.moveTo(cursor.x, cursor.y + 8);
    ctx.lineTo(cursor.x, cursor.y + 20);
    ctx.stroke();
  }
  if (state.screen === SCREEN_TITLE) drawTitle(ctx, world);
  else if (state.screen === SCREEN_CLEAR) drawClear(ctx, world);
  else if (state.screen === SCREEN_OVER) drawOver(ctx, world);
  else if (state.screen === SCREEN_WIN) drawWin(ctx, world);
  else if (state.screen === SCREEN_PAUSED) drawPaused(ctx);
  announceScreen();
}

function runShot(name) {
  const screen = stageShot(name, world);
  let painted = 0;
  function paint() {
    render(0);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
  return screen;
}

function runGame() {
  let accumulator = 0;
  let last = performance.now();
  function frame(now) {
    const elapsed = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    accumulator += elapsed;
    while (accumulator >= STEP) {
      world.update(STEP);
      accumulator -= STEP;
    }
    render(now / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// For the play-tests and the screenshots: the world, its state, and the staging hook.
window.__game = { world, stageShot };
if (shot) runShot(shot);
else runGame();
