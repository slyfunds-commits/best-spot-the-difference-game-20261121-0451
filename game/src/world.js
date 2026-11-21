// The game's state and rules: which screen is showing, what has been found, the timer, the
// score, hints and misses. The renderer only reads this state; it never changes it.
import { HINTS_PER_SCENE, HINT_COOLDOWN, HINT_PULSE, POINTS_FOUND, POINTS_MISS, TIME_BONUS_PER_SECOND } from './config.js';
import { SCENES } from './scenes.js';
import { differenceAt, remaining } from './differences.js';
import { playClear, playFound, playHint, playMiss, playTick, playWin } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';
export const SCREEN_PAUSED = 'paused';

/** A fresh world: title screen, no scene started. */
export function createWorld() {
  const state = {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    found: new Set(),
    score: 0,
    misses: 0,
    hintsLeft: HINTS_PER_SCENE,
    hintCooldown: 0,
    timeLeft: SCENES[0].time,
    message: '',
    messageTime: 0,
    hintTarget: null,
    hintTime: 0,
    missMarks: [],
    best: 0,
    cleared: [],
    totalFound: 0,
    lastTickSecond: -1,
    pausedFrom: SCREEN_PLAY,
  };

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function say(text, seconds = 2.5) {
    state.message = text;
    state.messageTime = seconds;
  }

  function startScene(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.hintsLeft = HINTS_PER_SCENE;
    state.hintCooldown = 0;
    state.hintTarget = null;
    state.timeLeft = SCENES[index].time;
    state.missMarks = [];
    state.lastTickSecond = -1;
    state.screen = SCREEN_PLAY;
    say(`${SCENES[index].name}: find ${SCENES[index].diffs.length} differences`, 3);
  }

  function startGame() {
    state.score = 0;
    state.misses = 0;
    state.cleared = [];
    state.totalFound = 0;
    startScene(0);
  }

  function reset() {
    state.screen = SCREEN_TITLE;
    state.sceneIndex = 0;
    state.found = new Set();
    state.score = 0;
    state.misses = 0;
    state.hintsLeft = HINTS_PER_SCENE;
    state.hintCooldown = 0;
    state.hintTarget = null;
    state.timeLeft = SCENES[0].time;
    state.message = '';
    state.missMarks = [];
    state.cleared = [];
    state.totalFound = 0;
  }

  /** A click inside a picture, in that picture's own coordinates, on panel 0 or 1. */
  function clickAt(x, y, panel = 0) {
    if (state.screen !== SCREEN_PLAY) return null;
    const diff = differenceAt(scene(), x, y);
    if (!diff) {
      state.misses += 1;
      state.score = Math.max(0, state.score - POINTS_MISS);
      state.missMarks.push({ x, y, panel, t: 0.9 });
      playMiss();
      say('Not there — look again', 1.5);
      return 'miss';
    }
    if (state.found.has(diff.id)) {
      say(`Already found ${diff.label}`, 1.2);
      return 'already';
    }
    state.found.add(diff.id);
    state.totalFound += 1;
    state.score += POINTS_FOUND;
    playFound();
    const left = remaining(scene(), state.found).length;
    if (left === 0) {
      const bonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
      state.score += bonus;
      state.cleared.push({ scene: state.sceneIndex, bonus, timeLeft: Math.round(state.timeLeft) });
      if (state.sceneIndex + 1 >= SCENES.length) {
        state.screen = SCREEN_WIN;
        if (state.score > state.best) state.best = state.score;
        playWin();
        say(`All three scenes cleared! Final score ${state.score}`, 5);
      } else {
        state.screen = SCREEN_CLEAR;
        playClear();
        say(`Scene clear! Time bonus +${bonus}`, 3);
      }
    } else {
      say(`Found ${diff.label}! ${left} left`, 1.8);
    }
    return 'found';
  }

  /** Spend a hint: pulse the next unfound difference. Returns the difference, or null. */
  function useHint() {
    if (state.screen !== SCREEN_PLAY) return null;
    if (state.hintsLeft <= 0) {
      say('No hints left in this scene', 1.5);
      return null;
    }
    if (state.hintCooldown > 0) {
      say(`Hint ready in ${Math.ceil(state.hintCooldown)}s`, 1.2);
      return null;
    }
    const rest = remaining(scene(), state.found);
    if (rest.length === 0) return null;
    const diff = rest[0];
    state.hintsLeft -= 1;
    state.hintCooldown = HINT_COOLDOWN;
    state.hintTarget = diff;
    state.hintTime = HINT_PULSE;
    playHint();
    say('Hint: look at the green ring', 1.8);
    return diff;
  }

  function nextScene() {
    if (state.screen === SCREEN_CLEAR && state.sceneIndex + 1 < SCENES.length) {
      startScene(state.sceneIndex + 1);
      return true;
    }
    return false;
  }

  function togglePause() {
    if (state.screen === SCREEN_PLAY) {
      state.pausedFrom = SCREEN_PLAY;
      state.screen = SCREEN_PAUSED;
    } else if (state.screen === SCREEN_PAUSED) {
      state.screen = state.pausedFrom;
    }
  }

  function update(dt) {
    if (state.messageTime > 0) state.messageTime -= dt;
    if (state.hintTime > 0) state.hintTime -= dt;
    if (state.hintCooldown > 0) state.hintCooldown -= dt;
    for (let i = state.missMarks.length - 1; i >= 0; i -= 1) {
      state.missMarks[i].t -= dt;
      if (state.missMarks[i].t <= 0) state.missMarks.splice(i, 1);
    }
    if (state.screen !== SCREEN_PLAY) return;
    state.timeLeft -= dt;
    const whole = Math.ceil(state.timeLeft);
    if (whole <= 10 && whole !== state.lastTickSecond && whole > 0) {
      state.lastTickSecond = whole;
      playTick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_OVER;
      if (state.score > state.best) state.best = state.score;
      say(`Time's up on ${scene().name}`, 3);
    }
  }

  return {
    state,
    scene,
    startGame,
    startScene,
    reset,
    clickAt,
    useHint,
    nextScene,
    togglePause,
    update,
    say,
  };
}
