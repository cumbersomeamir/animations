// dev helper: print screen positions of key points for candidate cameras (not part of the render)
import { camera, project } from './stage3d.mjs';
const BY = +(process.env.BY || 3.05), BZ = +(process.env.BZ || -0.2), BW = +(process.env.BW || 3.1);
const P = {
  barL: [-BW / 2, BY, BZ], barR: [BW / 2, BY, BZ], barTop: [0, BY + 0.25, BZ], badgeBot: [BW / 2 - 0.4, BY - 0.8, BZ],
  hopTop: [0.3, 2.2, -4.75], gateTop: [0.3, 1.8, -3.05], unpack: [0.3, 0.8, -1.45], beltNear: [0.3, 0.45, 0.55],
  phTop: [-1.25, 1.84, 0.45], phBot: [-1.25, 0.02, 1.25], phL: [-1.77, 0.93, 0.85], phR: [-0.73, 0.93, 0.85],
};
for (const c of JSON.parse(process.argv[2])) {
  const cam = camera(c[0], c[1], c[2]);
  console.log(JSON.stringify(c), Object.entries(P).map(([k, p]) => { const s = project(cam, p); return `${k}:${s.x | 0},${s.y | 0}`; }).join(' '));
}
