// The screenshot scenes behind ?shot=start|play|end. Each one plays the real rules forward
// from a fresh world, clicking real differences, so the frame is what a short game really
// looks like and the same seed always gives the same frame.
import { SCENES } from './scenes.js';

/**
 * Set `world` to the named scene (start, play or end; any other name is start) and return
 * the screen to draw over it.
 */
export function stageShot(name, world) {
  const state = world.state;
  if (name === 'play') {
    // Mid-game on the second room: 3 of its 7 differences found, markers on both pictures,
    // 4 still hiding, and the clock at 75 seconds.
    world.startGame();
    world.startScene(1);
    const scene = SCENES[1];
    for (const index of [0, 2, 5]) {
      const d = scene.diffs[index];
      world.clickAt(d.x, d.y, 0);
    }
    state.timeLeft = 75;
    return 'play';
  }
  if (name === 'end') {
    // A finished game: every difference in every room found, the win screen over the last room.
    world.startGame();
    for (let s = 0; s < SCENES.length; s += 1) {
      const scene = SCENES[s];
      for (const d of scene.diffs) world.clickAt(d.x, d.y, 0);
      if (s + 1 < SCENES.length) world.nextScene();
    }
    return 'win';
  }
  world.reset();
  return 'title';
}
