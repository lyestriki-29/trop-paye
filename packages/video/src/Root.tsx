import { Composition } from "remotion";
import { DemoScreen } from "./compositions/DemoScreen";
import { Explainer } from "./compositions/Explainer";
import { HookLoop } from "./compositions/HookLoop";
import { StatPunch } from "./compositions/StatPunch";
import { Teaser } from "./compositions/Teaser";
import { Temoignage } from "./compositions/Temoignage";
import { VerdictReveal } from "./compositions/VerdictReveal";

const FPS = 30;
/** Formats (spec P4) : 9:16 TikTok/Reels/Shorts · 1:1 X/LinkedIn · 16:9 site/presse. */
const VERTICAL = { width: 1080, height: 1920 } as const;
const SQUARE = { width: 1080, height: 1080 } as const;
const WIDE = { width: 1920, height: 1080 } as const;

/** Les 7 compositions P4 + déclinaisons explicites de la spec (VerdictReveal 1:1). */
export function RemotionRoot() {
  return (
    <>
      <Composition id="VerdictReveal" component={VerdictReveal} fps={FPS} durationInFrames={300} {...VERTICAL} />
      <Composition id="VerdictReveal-Carre" component={VerdictReveal} fps={FPS} durationInFrames={300} {...SQUARE} />
      <Composition id="HookLoop" component={HookLoop} fps={FPS} durationInFrames={180} {...VERTICAL} />
      <Composition id="StatPunch" component={StatPunch} fps={FPS} durationInFrames={210} {...VERTICAL} />
      <Composition id="Explainer" component={Explainer} fps={FPS} durationInFrames={1050} {...WIDE} />
      <Composition id="TeaserLancement" component={Teaser} fps={FPS} durationInFrames={450} {...VERTICAL} />
      <Composition id="Temoignage" component={Temoignage} fps={FPS} durationInFrames={540} {...VERTICAL} />
      <Composition id="DemoScreen" component={DemoScreen} fps={FPS} durationInFrames={720} {...VERTICAL} />
    </>
  );
}
