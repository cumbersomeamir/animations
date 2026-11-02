// Character/model sheet mode: renders Tinku turnaround, expressions and poses
// with the same rig, materials and lab lighting used in the episode.
import { DEFAULT_POSE } from './rig/tinku.js';

export function setupSheet({ THREE, renderer, scene, camera, tinku, cup, beaker, facilities }) {
  const CW = 720, CH = 900;
  renderer.setSize(CW, CH, false);
  const canvas = renderer.domElement;
  canvas.style.width = `${CW}px`; canvas.style.height = `${CH}px`;
  document.getElementById('overlay').style.display = 'none';
  cup.group.visible = false; beaker.group.visible = false; facilities.forEach((f) => { f.visible = false; });
  scene.traverse((o) => { if (o.name === 'route') o.visible = false; });
  camera.aspect = CW / CH; camera.fov = 30; camera.updateProjectionMatrix();

  const N = DEFAULT_POSE;
  const body = { cam: [0, 0.82, 4.3], at: [0, 0.64, 0] };
  const head = { cam: [0, 0.98, 2.15], at: [0, 0.78, 0] };
  const cells = [
    // turnaround
    { name: 'turn-front', yaw: 0, pose: {}, ...body },
    { name: 'turn-three-quarter', yaw: -0.65, pose: {}, ...body },
    { name: 'turn-side', yaw: -1.5708, pose: {}, ...body },
    { name: 'turn-back', yaw: Math.PI, pose: {}, ...body },
    // expressions
    { name: 'expr-neutral', yaw: -0.25, pose: { smile: 0.35 }, ...head },
    { name: 'expr-curious-loupe', yaw: -0.25, pose: { loupe: 1, browL: -0.25, browR: 0.7, smile: 0.1, look: [-0.5, 0.15], earL: 0.3, earR: 0.7 }, ...head },
    { name: 'expr-surprised', yaw: -0.25, pose: { eyeScale: 1.14, mouthOpen: 0.8, smile: 0.2, browL: 1, browR: 1, earL: 1, earR: 1 }, ...head },
    { name: 'expr-delighted', yaw: -0.25, pose: { smile: 1, squint: 0.55, lid: 0.25, browL: 0.6, browR: 0.6 }, ...head },
    { name: 'expr-uh-oh', yaw: -0.25, pose: { eyeScale: 1.12, mouthOpen: 0.45, smile: -0.2, browL: 0.9, browR: 0.9, look: [-0.9, 0.25], earL: 0.2, earR: 0.2 }, ...head },
    { name: 'expr-strain', yaw: -0.25, pose: { lid: 0.6, squint: 0.75, mouthOpen: 0.28, mouthWide: 1.4, smile: -0.45, browL: -0.7, browR: -0.7, earL: -0.3, earR: -0.3 }, ...head },
    { name: 'expr-dazed', yaw: -0.25, pose: { lid: 0.35, smile: -0.1, browL: 0.2, browR: -0.2, look: [0.3, -0.3] }, ...head },
    // poses
    { name: 'pose-tap', yaw: -0.55, pose: { handR: [-0.55, 0.78, 0.45], pitch: 0.1, look: [-0.7, 0.05], browL: 0.4, browR: 0.1 }, ...body },
    { name: 'pose-hop', yaw: -0.3, pose: { hop: 0.24, squash: 1.08, handL: [0.55, 0.62, 0.2], handR: [-0.55, 0.62, 0.2], smile: 0.9, earL: 1, earR: 1 }, ...body },
    { name: 'pose-point', yaw: -0.3, pose: { handR: [-0.62, 1.15, 0.35], smile: 0.9, look: [-0.8, 0.6], browL: 0.6, browR: 0.6 }, ...body },
    { name: 'pose-tug', yaw: -0.9, pose: { pitch: -0.36, handL: [0.12, 0.95, 0.75], handR: [-0.08, 0.95, 0.75], lid: 0.6, squint: 0.75, mouthOpen: 0.28, mouthWide: 1.4, smile: -0.45, browL: -0.7, browR: -0.7, earL: -0.3, earR: -0.3, squash: 0.93 }, ...body },
    { name: 'pose-shrug', yaw: -0.2, pose: { handL: [0.62, 0.66, 0.22], handR: [-0.62, 0.66, 0.22], browL: 1, browR: 1, smile: -0.1, mouthWide: 1.2, earL: 0.9, earR: 0.9, lean: -0.1 }, ...body },
    { name: 'pose-sit-dazed', yaw: -0.4, pose: { hop: -0.12, pitch: -0.42, lid: 0.35, smile: -0.1, handL: [0.5, 0.15, 0.1], handR: [-0.5, 0.15, 0.1] }, ...body },
  ];
  window.sheetCells = () => cells.map((c) => c.name);
  window.renderSheetCell = async (i) => {
    const c = cells[i];
    tinku.root.position.set(0, 0, 0); tinku.root.rotation.y = c.yaw;
    tinku.apply({ ...N, ...c.pose }, { antenna: 0 });
    camera.position.set(...c.cam); camera.lookAt(...c.at); camera.updateMatrixWorld(true);
    renderer.render(scene, camera);
    await new Promise((r) => requestAnimationFrame(() => r()));
  };
}
