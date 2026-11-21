// Mouse and keyboard input. The canvas is scaled to the window, so pointer positions are
// mapped back to the game's logical coordinates before the world sees them. The keyboard
// moves an on-screen cursor (arrows, Shift for fine steps) and marks with Enter or Space,
// so the game is fully playable without a mouse.
import { CURSOR_FINE_STEP, CURSOR_STEP, PANEL_LEFT, PANEL_RIGHT, VIEW } from './config.js';
import { unlockAudio } from './audio.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_HINT = 'hint';
export const ACTION_PAUSE = 'pause';
export const ACTION_RESTART = 'restart';
export const ACTION_NEXT = 'next';

/**
 * Wire up the canvas and the keyboard. `handlers` gets onPointer(x, y, panel) for a click
 * (panel 0 left, 1 right, or -1 outside both pictures), onKey(action) for game actions,
 * and onMove(x, y) for the pointer's logical position.
 */
export function createInput(canvas, handlers) {
  let cursor = { x: VIEW.width / 2, y: VIEW.height / 2 };
  let pointerInCanvas = false;

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIEW.width / rect.width;
    const scaleY = VIEW.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function panelAt(x, y) {
    if (x >= PANEL_LEFT.x && x <= PANEL_LEFT.x + PANEL_LEFT.w && y >= PANEL_LEFT.y && y <= PANEL_LEFT.y + PANEL_LEFT.h) return 0;
    if (x >= PANEL_RIGHT.x && x <= PANEL_RIGHT.x + PANEL_RIGHT.w && y >= PANEL_RIGHT.y && y <= PANEL_RIGHT.y + PANEL_RIGHT.h) return 1;
    return -1;
  }

  function panelLocal(panel, x, y) {
    const p = panel === 0 ? PANEL_LEFT : PANEL_RIGHT;
    return { x: x - p.x, y: y - p.y };
  }

  canvas.addEventListener('pointermove', (event) => {
    const pos = toLogical(event);
    cursor = { x: pos.x, y: pos.y };
    pointerInCanvas = true;
    handlers.onMove(pos.x, pos.y);
  });

  canvas.addEventListener('pointerdown', (event) => {
    unlockAudio();
    const pos = toLogical(event);
    cursor = { x: pos.x, y: pos.y };
    const panel = panelAt(pos.x, pos.y);
    if (panel === -1) {
      handlers.onOutside(pos.x, pos.y);
      return;
    }
    const local = panelLocal(panel, pos.x, pos.y);
    handlers.onPointer(local.x, local.y, panel);
  });

  canvas.addEventListener('pointerleave', () => {
    pointerInCanvas = false;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) return;
    unlockAudio();
    const step = event.shiftKey ? CURSOR_FINE_STEP : CURSOR_STEP;
    switch (event.key) {
      case 'ArrowLeft':
        cursor.x = Math.max(0, cursor.x - step);
        handlers.onMove(cursor.x, cursor.y);
        event.preventDefault();
        break;
      case 'ArrowRight':
        cursor.x = Math.min(VIEW.width, cursor.x + step);
        handlers.onMove(cursor.x, cursor.y);
        event.preventDefault();
        break;
      case 'ArrowUp':
        cursor.y = Math.max(0, cursor.y - step);
        handlers.onMove(cursor.x, cursor.y);
        event.preventDefault();
        break;
      case 'ArrowDown':
        cursor.y = Math.min(VIEW.height, cursor.y + step);
        handlers.onMove(cursor.x, cursor.y);
        event.preventDefault();
        break;
      case 'Enter':
      case ' ': {
        const panel = panelAt(cursor.x, cursor.y);
        if (panel === -1) handlers.onOutside(cursor.x, cursor.y);
        else {
          const local = panelLocal(panel, cursor.x, cursor.y);
          handlers.onPointer(local.x, local.y, panel);
        }
        event.preventDefault();
        break;
      }
      case 'h':
      case 'H':
        handlers.onKey(ACTION_HINT);
        break;
      case 'p':
      case 'P':
      case 'Escape':
        handlers.onKey(ACTION_PAUSE);
        break;
      case 'r':
      case 'R':
        handlers.onKey(ACTION_RESTART);
        break;
      case 'n':
      case 'N':
        handlers.onKey(ACTION_NEXT);
        break;
      case '1':
      case '2':
      case '3':
        handlers.onSceneKey(Number(event.key) - 1);
        break;
      default:
        break;
    }
  });

  return {
    getCursor() {
      return cursor;
    },
    isPointerInCanvas() {
      return pointerInCanvas;
    },
    setCursor(x, y) {
      cursor = { x, y };
    },
  };
}
