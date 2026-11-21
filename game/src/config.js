// Every tuning number and colour in one place. The playfield is a fixed 1280x800 logical
// area; the renderer scales it to the window, so no rule below depends on the screen size.
export const VIEW = { width: 1280, height: 800 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** The two picture panels: x, y, width, height in logical pixels. */
export const PANEL_LEFT = { x: 16, y: 100, w: 608, h: 640 };
export const PANEL_RIGHT = { x: 656, y: 100, w: 608, h: 640 };
export const PANEL_GAP = 32;

/** How close, in logical pixels, a click must land to a difference's centre to count. */
export const HIT_RADIUS = 34;

/** Points for a found difference; a wrong click costs this many points, never below zero. */
export const POINTS_FOUND = 100;
export const POINTS_MISS = 10;

/** Seconds of bonus per second left when a scene is cleared. */
export const TIME_BONUS_PER_SECOND = 2;

/** Hints: how many each scene allows, and the cooldown in seconds between two hints. */
export const HINTS_PER_SCENE = 3;
export const HINT_COOLDOWN = 12;
/** How long a hint's pulsing ring stays visible, in seconds. */
export const HINT_PULSE = 1.6;

/** Keyboard cursor: arrow keys move it this far, Shift held moves it this far instead. */
export const CURSOR_STEP = 18;
export const CURSOR_FINE_STEP = 5;

/** The three scenes, in order, with their time limits in seconds. */
export const SCENE_ORDER = [
  { id: 'attic', name: 'The Attic', sub: 'A quiet room full of small secrets', time: 150, diffs: 5 },
  { id: 'shed', name: 'The Garden Shed', sub: 'Tools, pots and one very patient bird', time: 120, diffs: 7 },
  { id: 'market', name: 'The Night Market', sub: 'Lanterns, fruit and a cat that knows', time: 100, diffs: 9 },
];

export const BEST_KEY = 'curious-attic-best';

export const COLORS = {
  page: '#14101d',
  hud: '#1d1729',
  hudLine: '#3a2f52',
  ink: '#f5efe0',
  dim: '#b9adc9',
  gold: '#f2c14e',
  green: '#7ec850',
  red: '#e4574d',
  blue: '#5aa9e6',
  panelEdge: '#6b5a8a',
  panelShadow: 'rgba(0,0,0,0.45)',
};
