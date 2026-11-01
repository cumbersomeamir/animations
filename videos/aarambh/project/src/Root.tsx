import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { Film } from "./Film";
import { RigTest } from "./RigTest";

export const Root: React.FC = () => (
  <>
    <Composition id="Aarambh30" component={Film} durationInFrames={900} fps={30} width={1080} height={1920} />
    <Composition id="RigTest" component={RigTest} durationInFrames={60} fps={30} width={1080} height={1920} />
  </>
);
