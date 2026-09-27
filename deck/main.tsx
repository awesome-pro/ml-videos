import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { MINI_INFERENCE_SCENES } from "../src/episodes/MiniInferenceLoop";
import { EXIT_FADE_FRAMES } from "../src/components/shared/SceneShell";
import { FPS, HEIGHT, WIDTH } from "../src/videoConfig";
import "../src/index.css";
import "./deck.css";

/**
 * The presenter deck: the episode's scenes as slides.
 *
 * This is not the video. Each slide is one scene, played on its own and stopped
 * on its last readable frame — so you can talk over a still frame, then step to
 * the next one with an arrow key. Nothing runs on into the next scene, because
 * there is no "next scene" here; you decide when to move.
 *
 * The slide list comes from `MINI_INFERENCE_SCENES`, the same manifest the video
 * is assembled from, so the deck can never fall out of step with the episode.
 */

const SCENES = MINI_INFERENCE_SCENES;

/** The last frame that is not part of the scene's exit fade to black. */
const lastReadable = (duration: number) => Math.max(0, duration - EXIT_FADE_FRAMES - 1);

const seconds = (frames: number) => `${(frames / FPS).toFixed(1)}s`;

const Deck: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [loop, setLoop] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const player = useRef<PlayerRef>(null);
  const list = useRef<HTMLDivElement>(null);

  const count = SCENES.length;
  const scene = SCENES[index];
  const end = lastReadable(scene.durationInFrames);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  // Re-subscribe whenever the slide changes: the Player is keyed by scene id so
  // it remounts, which gives every slide a fresh playhead at frame 0.
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    p.addEventListener("frameupdate", onFrame);
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    setFrame(0);
    setPlaying(true);
    return () => {
      p.removeEventListener("frameupdate", onFrame);
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
    };
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const jump = (delta: number) => {
        e.preventDefault();
        go(index + delta);
      };
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          jump(1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          jump(-1);
          break;
        case " ":
          e.preventDefault();
          player.current?.toggle();
          break;
        case "Home":
          jump(-index);
          break;
        case "End":
          jump(count - 1 - index);
          break;
        case "r":
        case "R":
          player.current?.seekTo(0);
          player.current?.play();
          break;
        case "l":
        case "L":
          setLoop((v) => !v);
          break;
        case "f":
        case "F": {
          const p = player.current;
          if (!p) break;
          if (p.isFullscreen()) p.exitFullscreen();
          else p.requestFullscreen();
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go, count]);

  // Keep the current slide in view when the list is longer than the window.
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-slide="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  return (
    <div className="deck">
      <header className="head">
        <h1>The Mini Inference Loop</h1>
        <div className="now">
          {String(index + 1).padStart(2, "0")} / {count} · <b>{scene.title}</b>
        </div>
        <button onClick={() => go(index - 1)} title="Previous slide (←)">◀</button>
        <button onClick={() => go(index + 1)} title="Next slide (→)">▶</button>
        <button onClick={() => { player.current?.seekTo(0); player.current?.play(); }} title="Replay from the start (R)">
          ⟲
        </button>
        <button onClick={() => player.current?.toggle()} title="Play / pause (Space)">
          {playing ? "❙❙" : "▶"}
        </button>
        <button className={loop ? "on" : ""} onClick={() => setLoop((v) => !v)} title="Loop this slide (L)">
          Loop
        </button>
        <button onClick={() => { const p = player.current; if (p) { if (p.isFullscreen()) p.exitFullscreen(); else p.requestFullscreen(); } }} title="Fullscreen (F)">
          ⛶
        </button>
      </header>

      <div className="body">
        <nav className="list" ref={list}>
          {SCENES.map((s, i) => (
            <button key={s.id} data-slide={i} className={i === index ? "on" : ""} onClick={() => setIndex(i)}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <span className="t">{s.title}</span>
              <span className="d">{seconds(s.durationInFrames)}</span>
            </button>
          ))}
        </nav>

        <main className="stage">
          <div className="frame">
            <Player
              key={scene.id}
              ref={player}
              component={scene.component}
              durationInFrames={scene.durationInFrames}
              fps={FPS}
              compositionWidth={WIDTH}
              compositionHeight={HEIGHT}
              autoPlay
              loop={loop}
              // Stop before the scene's exit fade: its last 18 frames are black
              // on purpose, because in the finished video the next scene cuts in
              // over them. As a standalone slide, stopping there would leave a
              // blank screen to talk over.
              outFrame={end}
              moveToBeginningWhenEnded={false}
              controls={false}
              clickToPlay={false}
              spaceKeyToPlayOrPause={false}
              doubleClickToFullscreen
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </main>
      </div>

      <footer className="foot">
        <span className="chip">
          frame {frame} / {end}
        </span>
        <div className="bar">
          <i style={{ width: `${Math.min(100, ((frame + 1) / (end + 1)) * 100)}%` }} />
        </div>
        <span className="keys">
          <kbd>←</kbd> <kbd>→</kbd> slides · <kbd>space</kbd> play · <kbd>r</kbd> replay · <kbd>l</kbd> loop ·{" "}
          <kbd>f</kbd> fullscreen
        </span>
      </footer>
    </div>
  );
};

// No StrictMode on purpose: its development double-mount would initialise the
// Player twice on every slide change, which is exactly the kind of flicker a
// presentation cannot afford.
createRoot(document.getElementById("root")!).render(<Deck />);
