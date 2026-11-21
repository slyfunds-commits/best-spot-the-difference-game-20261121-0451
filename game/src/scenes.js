// The three scenes, drawn procedurally in code: no image is loaded, every picture is a list
// of shapes. Each scene draws the same base for both panels, then changes exactly its
// differences when variant is 1 (the right-hand picture). A difference's x, y and r are in
// panel coordinates (the panel is 608 by 640) and double as its click target.
import { circle, crescent, ellipse, line, poly, rect, ring, roundRect, shade, star, text } from './draw.js';

/** A sitting cat, drawn as simple dark shapes. */
function drawCat(ctx, x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -26, 15, 0, Math.PI * 2);
  ctx.fill();
  poly(ctx, [[-12, -36], [-6, -52], [-2, -38]], color);
  poly(ctx, [[12, -36], [6, -52], [2, -38]], color);
  ctx.beginPath();
  ctx.ellipse(-16, 14, 8, 12, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, 14, 8, 12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.arc(-5, -28, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -28, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A row of books on a shelf: count changes with the variant. */
function drawBooks(ctx, x, y, count, palette) {
  const widths = [16, 20, 14, 18, 15];
  let bx = x;
  for (let i = 0; i < count; i += 1) {
    const w = widths[i % widths.length];
    const h = 52 - (i % 3) * 6;
    rect(ctx, bx, y - h, w, h, palette[i % palette.length]);
    rect(ctx, bx, y - h, w, 6, shade(palette[i % palette.length], 0.75));
    bx += w + 3;
  }
}

// ---------------------------------------------------------------- scene 1: attic
function drawAttic(ctx, variant) {
  const W = 608;
  const H = 640;
  rect(ctx, 0, 0, W, 430, '#d9b98a');
  rect(ctx, 0, 430, W, 210, '#8a5a33');
  for (let i = 0; i < 7; i += 1) line(ctx, 0, 452 + i * 28, W, 452 + i * 28, '#7a4e2b', 3);
  poly(ctx, [[0, 0], [W, 0], [W, 60], [0, 110]], '#6b4a2f');
  line(ctx, 0, 108, W, 58, '#4e3421', 10);
  line(ctx, 200, 84, 260, 0, '#4e3421', 8);
  line(ctx, 420, 72, 480, 0, '#4e3421', 8);
  // Round window with the night sky and the moon (difference 4).
  circle(ctx, 310, 110, 58, '#3a2f52');
  circle(ctx, 310, 110, 50, '#1c2440');
  if (variant === 0) crescent(ctx, 310, 108, 20, '#f5efe0', '#1c2440');
  else circle(ctx, 310, 108, 20, '#f5efe0');
  star(ctx, 280, 82, 5, 2, '#f5efe0');
  star(ctx, 338, 92, 4, 2, '#f5efe0');
  star(ctx, 330, 132, 4, 2, '#f5efe0');
  ring(ctx, 310, 110, 54, '#f2c14e', 5);
  line(ctx, 310, 56, 310, 164, '#f2c14e', 4);
  line(ctx, 256, 110, 364, 110, '#f2c14e', 4);
  // Hanging bulb.
  line(ctx, 470, 60, 470, 120, '#3a2f52', 3);
  circle(ctx, 470, 132, 12, '#f2c14e');
  circle(ctx, 470, 132, 22, 'rgba(242,193,78,0.25)');
  // Cobweb in the top-left corner.
  ctx.strokeStyle = 'rgba(245,239,224,0.7)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 20 + i * 18);
    ctx.quadraticCurveTo(40 + i * 8, 40 + i * 8, 20 + i * 18, 0);
    ctx.stroke();
  }
  // Bookshelf with its books (difference 3: four books, or three).
  rect(ctx, 60, 240, 150, 180, '#5a3a22');
  rect(ctx, 68, 300, 134, 10, '#7a4e2b');
  rect(ctx, 68, 370, 134, 10, '#7a4e2b');
  drawBooks(ctx, 76, 300, variant === 0 ? 4 : 3, ['#b8443a', '#3a6ea5', '#4d8a4d', '#c98a2e']);
  drawBooks(ctx, 76, 370, 3, ['#7a4a8a', '#2e7f7a', '#b8443a']);
  circle(ctx, 185, 345, 14, '#c98a2e');
  // Framed picture on the wall.
  rect(ctx, 420, 250, 90, 70, '#3a6ea5');
  rect(ctx, 428, 258, 74, 54, '#d9b98a');
  poly(ctx, [[440, 300], [465, 268], [490, 300]], '#4d8a4d');
  circle(ctx, 488, 268, 7, '#f2c14e');
  // Standing lamp (difference 2: amber shade, or teal).
  line(ctx, 520, 260, 520, 430, '#3a2f52', 6);
  ellipse(ctx, 520, 434, 34, 8, '#3a2f52');
  poly(ctx, [[490, 260], [550, 260], [536, 196], [504, 196]], variant === 0 ? '#f2a541' : '#4d9a9a');
  circle(ctx, 520, 232, 18, 'rgba(242,193,78,0.35)');
  // Chest under the window.
  roundRect(ctx, 400, 470, 150, 80, 8, '#6b4423');
  roundRect(ctx, 400, 470, 150, 22, 8, '#7d5230');
  circle(ctx, 475, 500, 8, '#f2c14e');
  // Rug with its stripe (difference 5: the red stripe, or plain).
  roundRect(ctx, 170, 540, 280, 74, 10, '#a03a30');
  roundRect(ctx, 182, 552, 256, 50, 8, '#c05248');
  if (variant === 0) rect(ctx, 182, 572, 256, 10, '#f5efe0');
  // The cat on the rug (difference 1: there, or gone).
  if (variant === 0) drawCat(ctx, 210, 530, 1, '#3a3345');
  // A ball of yarn by the chest.
  circle(ctx, 560, 580, 16, '#b8443a');
  ctx.strokeStyle = '#8a2f28';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(560, 580, 10, 0.4, 2.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(560, 580, 5, 2.2, 4.4);
  ctx.stroke();
}

// ---------------------------------------------------------------- scene 2: garden shed
function drawShed(ctx, variant) {
  const W = 608;
  const H = 640;
  rect(ctx, 0, 0, W, H, '#a9805a');
  for (let i = 0; i < 9; i += 1) line(ctx, i * 72, 0, i * 72, H, '#96683f', 3);
  rect(ctx, 0, 470, W, 170, '#7a5230');
  for (let i = 0; i < 6; i += 1) line(ctx, 0, 492 + i * 28, W, 492 + i * 28, '#6b4423', 3);
  // Window with its curtain (difference 7: open, or drawn shut).
  rect(ctx, 240, 60, 130, 120, '#3a2f52');
  rect(ctx, 250, 70, 110, 100, '#9ec7e8');
  circle(ctx, 330, 100, 16, '#f2c14e');
  poly(ctx, [[260, 170], [300, 120], [350, 170]], '#4d8a4d');
  if (variant === 1) {
    rect(ctx, 250, 70, 52, 100, '#c98a2e');
    rect(ctx, 308, 70, 52, 100, '#c98a2e');
  } else {
    rect(ctx, 244, 62, 26, 116, '#c98a2e');
    rect(ctx, 344, 62, 26, 116, '#c98a2e');
  }
  ring(ctx, 305, 120, 58, '#5a3a22', 6);
  // Birdhouse (difference 4: a round door, or a solid front).
  poly(ctx, [[480, 130], [560, 130], [520, 100]], '#b8443a');
  rect(ctx, 488, 130, 64, 56, '#c98a2e');
  if (variant === 0) circle(ctx, 520, 158, 12, '#3a2f52');
  line(ctx, 520, 186, 520, 210, '#5a3a22', 5);
  // Shelf with pots and jars (difference 6: an extra jar on the right).
  rect(ctx, 60, 210, 500, 14, '#5a3a22');
  roundRect(ctx, 90, 168, 46, 42, 6, '#b8443a');
  roundRect(ctx, 150, 176, 38, 34, 6, '#4d8a4d');
  roundRect(ctx, 210, 164, 50, 46, 6, '#3a6ea5');
  if (variant === 1) roundRect(ctx, 380, 172, 42, 38, 6, '#c98a2e');
  roundRect(ctx, 440, 170, 40, 40, 6, '#7a4a8a');
  // Hanging tools: the hammer (difference 1), a saw and a spade.
  if (variant === 0) {
    line(ctx, 120, 240, 120, 310, '#8a6a45', 8);
    rect(ctx, 96, 232, 48, 22, '#5a5a5a');
  }
  poly(ctx, [[190, 250], [240, 250], [240, 268], [190, 268]], '#c8ccd0');
  line(ctx, 190, 259, 178, 300, '#8a6a45', 7);
  for (let i = 0; i < 4; i += 1) line(ctx, 196 + i * 12, 250, 196 + i * 12, 268, '#8a8f96', 2);
  line(ctx, 300, 240, 300, 310, '#8a6a45', 7);
  ellipse(ctx, 300, 322, 16, 22, '#7a8a99');
  // Bicycle wheel leaning on the wall (difference 5: six spokes, or four).
  circle(ctx, 150, 500, 62, '#3a2f52');
  circle(ctx, 150, 500, 52, '#c8ccd0');
  circle(ctx, 150, 500, 46, '#7a5230');
  const spokes = variant === 0 ? 6 : 4;
  for (let i = 0; i < spokes; i += 1) {
    const a = (i * Math.PI * 2) / spokes;
    line(ctx, 150, 500, 150 + Math.cos(a) * 46, 500 + Math.sin(a) * 46, '#c8ccd0', 3);
  }
  circle(ctx, 150, 500, 8, '#3a2f52');
  // Watering can (difference 2: green, or blue).
  const canColor = variant === 0 ? '#4d8a4d' : '#3a6ea5';
  roundRect(ctx, 430, 500, 80, 56, 10, canColor);
  line(ctx, 510, 516, 548, 496, canColor, 10);
  circle(ctx, 552, 494, 7, canColor);
  line(ctx, 430, 510, 414, 486, canColor, 8);
  // Potted plants on the floor; one plant's blooms change colour (difference 3).
  roundRect(ctx, 250, 540, 70, 50, 6, '#b8443a');
  line(ctx, 285, 540, 285, 480, '#4d8a4d', 5);
  line(ctx, 285, 500, 262, 478, '#4d8a4d', 4);
  line(ctx, 285, 500, 308, 476, '#4d8a4d', 4);
  const bloom = variant === 0 ? '#e4574d' : '#f2c14e';
  circle(ctx, 262, 474, 10, bloom);
  circle(ctx, 308, 472, 10, bloom);
  circle(ctx, 285, 462, 11, bloom);
  roundRect(ctx, 340, 552, 56, 40, 6, '#3a6ea5');
  line(ctx, 368, 552, 368, 506, '#4d8a4d', 5);
  circle(ctx, 368, 498, 9, '#e4574d');
  circle(ctx, 356, 508, 8, '#f2c14e');
}

// ---------------------------------------------------------------- scene 3: night market
function drawMarket(ctx, variant) {
  const W = 608;
  const H = 640;
  rect(ctx, 0, 0, W, 300, '#1c2440');
  rect(ctx, 0, 300, W, 340, '#3a2f52');
  rect(ctx, 0, 560, W, 80, '#2a2138');
  for (let i = 0; i < 40; i += 1) {
    const sx = (i * 97) % W;
    const sy = (i * 53) % 240;
    star(ctx, sx, sy, 3, 1.2, i % 3 === 0 ? '#f2c14e' : '#f5efe0');
  }
  // The moon (difference 9: crescent, or full).
  if (variant === 0) crescent(ctx, 545, 55, 24, '#f5efe0', '#1c2440');
  else circle(ctx, 545, 55, 24, '#f5efe0');
  // String lights; one bulb is out on the right (difference 6).
  ctx.strokeStyle = '#3a2f52';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.quadraticCurveTo(W / 2, 110, W, 40);
  ctx.stroke();
  for (let i = 0; i < 9; i += 1) {
    const bx = 40 + i * 66;
    const by = 40 + Math.sin((i / 8) * Math.PI) * 46;
    const lit = !(variant === 1 && i === 6);
    circle(ctx, bx, by + 12, 7, lit ? '#f2c14e' : '#4a4458');
    if (lit) circle(ctx, bx, by + 12, 14, 'rgba(242,193,78,0.3)');
  }
  // Left stall with its striped awning (difference 5: five stripes, or four).
  const stripes = variant === 0 ? 5 : 4;
  for (let i = 0; i < stripes; i += 1) {
    rect(ctx, 40 + i * (260 / stripes), 180, 260 / stripes, 44, i % 2 === 0 ? '#b8443a' : '#f5efe0');
  }
  rect(ctx, 40, 224, 260, 10, '#7a2f28');
  rect(ctx, 60, 234, 220, 130, '#8a5a33');
  rect(ctx, 60, 234, 220, 12, '#a9805a');
  // The stall sign with its star (difference 4).
  roundRect(ctx, 240, 70, 120, 44, 8, '#2e3a5c');
  ring(ctx, 300, 92, 20, '#f2c14e', 3);
  if (variant === 0) star(ctx, 300, 92, 12, 5, '#f2c14e');
  // A lantern hanging by the stall (difference 1: red, or gold).
  line(ctx, 120, 180, 120, 140, '#3a2f52', 3);
  ellipse(ctx, 120, 160, 16, 22, variant === 0 ? '#e4574d' : '#f2c14e');
  circle(ctx, 120, 160, 24, variant === 0 ? 'rgba(228,87,77,0.25)' : 'rgba(242,193,78,0.25)');
  // Right stall.
  for (let i = 0; i < 5; i += 1) {
    rect(ctx, 340 + i * 48, 200, 48, 40, i % 2 === 0 ? '#3a6ea5' : '#f5efe0');
  }
  rect(ctx, 340, 240, 240, 10, '#24405c');
  rect(ctx, 360, 250, 200, 120, '#5a3a22');
  rect(ctx, 360, 250, 200, 12, '#7a5230');
  // The vendor behind the counter, with a hat (difference 7).
  circle(ctx, 520, 300, 22, '#e8b98a');
  if (variant === 0) {
    poly(ctx, [[492, 292], [548, 292], [520, 258]], '#f2c14e');
    rect(ctx, 488, 288, 64, 8, '#f2c14e');
  }
  rect(ctx, 492, 322, 56, 60, '#3a6ea5');
  // Fruit crate (difference 2: red apples, or oranges).
  roundRect(ctx, 260, 520, 90, 60, 6, '#6b4423');
  const fruit = variant === 0 ? '#e4574d' : '#e8822e';
  circle(ctx, 280, 512, 12, fruit);
  circle(ctx, 306, 506, 12, fruit);
  circle(ctx, 330, 512, 12, fruit);
  circle(ctx, 292, 528, 12, fruit);
  circle(ctx, 318, 528, 12, fruit);
  // Crate stack (difference 8: three crates, or two).
  const crates = variant === 0 ? 3 : 2;
  for (let i = 0; i < crates; i += 1) {
    roundRect(ctx, 60, 560 - i * 42, 64, 38, 4, '#8a6a45');
    line(ctx, 60, 560 - i * 42 + 19, 124, 560 - i * 42 + 19, '#6b4e2e', 3);
  }
  // The cat on a crate (difference 3: there, or gone).
  if (variant === 0) drawCat(ctx, 480, 500, 0.9, '#2a2438');
  roundRect(ctx, 440, 530, 90, 50, 6, '#6b4423');
  // Cobblestones at the bottom.
  for (let i = 0; i < 12; i += 1) ellipse(ctx, 30 + i * 52, 610, 24, 10, i % 2 === 0 ? '#332a44' : '#2a2138');
}

export const SCENES = [
  {
    id: 'attic',
    name: 'The Attic',
    sub: 'A quiet room full of small secrets',
    time: 150,
    draw: drawAttic,
    diffs: [
      { id: 'cat', x: 210, y: 520, r: 34, label: 'the cat' },
      { id: 'lamp', x: 520, y: 225, r: 30, label: 'the lamp shade' },
      { id: 'books', x: 147, y: 274, r: 28, label: 'the books' },
      { id: 'moon', x: 310, y: 108, r: 30, label: 'the moon' },
      { id: 'stripe', x: 310, y: 577, r: 30, label: 'the rug stripe' },
    ],
  },
  {
    id: 'shed',
    name: 'The Garden Shed',
    sub: 'Tools, pots and one very patient bird',
    time: 120,
    draw: drawShed,
    diffs: [
      { id: 'hammer', x: 120, y: 268, r: 30, label: 'the hammer' },
      { id: 'can', x: 475, y: 528, r: 34, label: 'the watering can' },
      { id: 'bloom', x: 285, y: 472, r: 28, label: 'the flowers' },
      { id: 'birdhouse', x: 520, y: 158, r: 26, label: 'the birdhouse door' },
      { id: 'wheel', x: 150, y: 500, r: 36, label: 'the wheel spokes' },
      { id: 'jar', x: 401, y: 191, r: 26, label: 'the extra jar' },
      { id: 'curtain', x: 305, y: 120, r: 30, label: 'the curtain' },
    ],
  },
  {
    id: 'market',
    name: 'The Night Market',
    sub: 'Lanterns, fruit and a cat that knows',
    time: 100,
    draw: drawMarket,
    diffs: [
      { id: 'lantern', x: 120, y: 160, r: 28, label: 'the lantern' },
      { id: 'fruit', x: 305, y: 518, r: 32, label: 'the fruit' },
      { id: 'cat', x: 480, y: 492, r: 32, label: 'the cat' },
      { id: 'sign', x: 300, y: 92, r: 24, label: 'the sign star' },
      { id: 'awning', x: 170, y: 202, r: 30, label: 'the awning stripes' },
      { id: 'bulb', x: 436, y: 82, r: 22, label: 'the string light' },
      { id: 'hat', x: 520, y: 288, r: 28, label: 'the vendor hat' },
      { id: 'crates', x: 92, y: 500, r: 32, label: 'the crates' },
      { id: 'moon', x: 545, y: 55, r: 26, label: 'the moon' },
    ],
  },
];
