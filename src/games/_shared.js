// _shared.js — helpers shared by several microgames. Files whose names start with '_' are not wrapped, so what they define is global.
const ANIMAL_SOUND = { sheep: 'baa', elephant: 'honk', giraffe: 'pop', cat: 'meow', goat: 'baa', camel: 'bray', donkey: 'bray', lion: 'roar' };
function drawAnimal(c, kind, x, y, s, t, phase = 0, lifted = false) {
  const o = { t, phase, hop: lifted }; const sizes = { sheep: 1, elephant: 0.8, giraffe: 0.75, cat: 1.1, goat: 1, camel: 0.85, donkey: 0.95, lion: 0.9 };
  P[kind](c, x, y, s * (sizes[kind] || 1), o);
}
// the ark, shared by every ark microgame
const ARK = {
  draw(c, x, y, s = 1) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const hull = c.createLinearGradient(0, -60, 0, 30); hull.addColorStop(0, '#b07a48'); hull.addColorStop(1, '#6a4224');
    c.fillStyle = hull; c.strokeStyle = '#3e2412'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-150, -40); c.quadraticCurveTo(-120, 30, -40, 32); c.lineTo(80, 32); c.quadraticCurveTo(150, 20, 170, -46); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(60,30,10,0.5)'; c.lineWidth = 1.5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-140 + i * 4, -30 + i * 12); c.quadraticCurveTo(10, -24 + i * 14, 162 - i * 6, -36 + i * 12); c.stroke(); }
    const cab = c.createLinearGradient(0, -110, 0, -40); cab.addColorStop(0, '#d8a46a'); cab.addColorStop(1, '#9a6a3a'); c.fillStyle = cab; c.fillRect(-80, -100, 170, 62); c.strokeRect(-80, -100, 170, 62);
    c.fillStyle = '#7a3a2a'; c.beginPath(); c.moveTo(-95, -98); c.lineTo(5, -140); c.lineTo(105, -98); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.moveTo(-95, -98); c.lineTo(5, -140); c.lineTo(10, -136); c.lineTo(-85, -98); c.fill();
    c.fillStyle = '#ffcf7a'; for (let i = 0; i < 4; i++) { if (i === 2) continue; c.fillRect(-64 + i * 40, -88, 16, 14); } c.fillStyle = '#3a1e10'; c.fillRect(-10, -72, 34, 34);
    c.restore();
  },
  ramp(c) {
    c.fillStyle = '#8a5a30'; c.strokeStyle = '#3e2412'; c.lineWidth = 2; c.beginPath(); c.moveTo(195, 386); c.lineTo(229, 386); c.lineTo(250, 470); c.lineTo(170, 470); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(40,20,10,0.4)'; for (let i = 1; i < 6; i++) { const k = i / 6; c.beginPath(); c.moveTo(195 - 25 * k, 386 + 84 * k); c.lineTo(229 + 21 * k, 386 + 84 * k); c.stroke(); }
  },
};
