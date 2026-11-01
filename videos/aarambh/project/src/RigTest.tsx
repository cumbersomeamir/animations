import React from "react";
import { AbsoluteFill } from "remotion";
import { Stick, STAND } from "./lib/rig";
import { C } from "./lib/theme";
import { SewingMachine, RequestCard, Stamp, Magnifier, Phone, Box, Bicycle, Clock, Stool, Slip, Kurta, Fabric, Star, BikeGlyph, ToolboxGlyph } from "./lib/props";

export const Defs = () => (
  <defs>
    <filter id="paper" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="7" stdDeviation="0" floodColor={C.ink} floodOpacity="0.16" />
    </filter>
  </defs>
);

export const RigTest: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <svg width={1080} height={1920}>
      <Defs />
      <SewingMachine x={270} y={330} wheel={30} needle={0.5} />
      <SewingMachine x={760} y={330} sketch={0.6} fill={0} />
      <RequestCard x={540} y={620} stamp={1} />
      <Stamp x={200} y={1000} />
      <Magnifier x={540} y={950} id="m1"><SewingMachine x={0} y={60} s={0.8} /></Magnifier>
      <Phone x={880} y={1000} s={0.7} id="p1"><BikeGlyph x={0} y={-150} s={1.5}/><ToolboxGlyph x={0} y={0} s={1.5}/></Phone>
      <Box x={220} y={1450} flapL={0.5} flapR={1} tape={0.5} />
      <Bicycle x={620} y={1500} spin={20} crank={40}>
        <Stick p={{ ...STAND, x: -58, y: -210, torso: 28, nhx: 168, nhy: -3, fhx: 160, fhy: 0, nfx: 38 + 30, nfy: 142, ffx: 38 - 30, ffy: 142 }} look={{ outfit: C.gold, hair: "cap" }} />
      </Bicycle>
      <Clock x={940} y={1300} sec={90} />
      <Stool x={900} y={1700} h={160} />
      <Slip x={300} y={1700} tick={1} />
      <Kurta x={560} y={1600} color={C.green} trim={C.gold} />
      <Fabric x={680} y={1780} w={300} h={90} />
      <Star x={100} y={1800} r={50} />
    </svg>
  </AbsoluteFill>
);
