// dev helper: print screen positions of key points for candidate cameras (not part of the render)
import { camera, project } from './stage3d.mjs';
const ME = [-0.9, 0.93, 2.4], SV = [0.95, 0, -0.9], FR = [-0.95, 0.93, -3.7];
const P = {
  meTop: [ME[0], 1.84, ME[2] - 0.41], meBot: [ME[0], 0.02, ME[2] + 0.41], meL: [ME[0] - 0.52, 0.93, ME[2]], meR: [ME[0] + 0.52, 0.93, ME[2]],
  srvTop: [SV[0], 2.3, SV[2] + 0.55], srvBot: [SV[0], 0, SV[2] + 0.55], srvL: [SV[0] - 0.9, 1.3, SV[2] + 0.55], srvR: [SV[0] + 0.9, 1.3, SV[2] + 0.55], win: [SV[0], 1.6, SV[2] + 0.71],
  frTop: [FR[0], 1.84, FR[2] - 0.41], frBot: [FR[0], 0.02, FR[2] + 0.41], frL: [FR[0] - 0.52, 0.93, FR[2]], frR: [FR[0] + 0.52, 0.93, FR[2]],
};
for (const c of JSON.parse(process.argv[2])) {
  const cam = camera(c[0], c[1], c[2]);
  console.log(JSON.stringify(c), Object.entries(P).map(([k, p]) => { const s = project(cam, p); return `${k}:${s.x | 0},${s.y | 0}`; }).join(' '));
}
