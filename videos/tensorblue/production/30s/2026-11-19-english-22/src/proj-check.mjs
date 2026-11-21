// dev helper: print screen positions of key points for candidate cameras (not part of the render)
import { camera, project } from './stage3d.mjs';
const P = { portalTop: [0, 0.45, -2.5], portalBot: [0, 0, -2.5], ridgeTop: [0.75, 1.55, -4.6], ridgeFar: [0.75, 1.9, -8.0], carNear: [0, 0.1, -1.0], car60: [0, 0.1, -1.5], ridgeLeft: [-1.05, 0.9, -3.0], ridgeRight: [2.55, 0.9, -3.0] };
for (const c of JSON.parse(process.argv[2])) {
  const cam = camera(c[0], c[1], c[2]);
  console.log(JSON.stringify(c), Object.entries(P).map(([k, p]) => { const s = project(cam, p); return `${k}:${s.x | 0},${s.y | 0}`; }).join(' '));
}
