import React from "react";
import { Composition } from "remotion";
import { loadFont } from "@remotion/google-fonts/BricolageGrotesque";
import { VideoShort, Voice } from "./qrix/VideoShort";
import { Scene3D } from "./qrix3d/Scene3D";
import { FlatShort } from "./qrixflat/FlatShort";
import voice413 from "../public/audio/photo-413x531.json";

loadFont();

/**
 * One composition per script. The duration is read from the voice track rather
 * than typed in, because the voice is what the cuts and captions are pinned to
 * — a hand-written frame count goes stale the moment a line is re-recorded.
 */
export const RemotionRoot: React.FC = () => {
  const voice = voice413 as Voice;
  return (
    <>
    <Composition
      id="photo-413x531"
      component={VideoShort}
      durationInFrames={Math.round((voice.total + 1.1) * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ voice, recDir: "rec/photo-413x531" }}
    />
    <Composition
      id="photo-413x531-3d"
      component={Scene3D}
      durationInFrames={Math.round((voice.total + 1.1) * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ voice, recSrc: "rec/photo-413x531/frame.png", recDir: "rec/photo-413x531" }}
    />
    <Composition
      id="photo-413x531-flat"
      component={FlatShort}
      durationInFrames={Math.round((voice.total + 1.1) * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ voice, recDir: "rec/photo-413x531" }}
    />
    </>
  );
};
