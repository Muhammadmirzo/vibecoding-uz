"use client";

import type { VideoController } from "./types";

interface ProgressBarProps { controller: VideoController }

export function ProgressBar({ controller }: ProgressBarProps) {
  const progressPercent = controller.duration > 0 ? (controller.currentTime / controller.duration) * 100 : 0;
  return (
    <div className="group/scrubber relative mb-3 flex min-h-11 items-center">
      <label className="sr-only" htmlFor="video-progress">Dars vaqti bo&apos;yicha o&apos;tish</label>
      <input id="video-progress" type="range" min={0} max={controller.duration || 100} step={0.1} value={controller.currentTime} onChange={controller.handleSeek} aria-valuetext={`${Math.floor(controller.currentTime / 60)} daqiqa ${Math.floor(controller.currentTime % 60)} soniya`} className="h-11 w-full cursor-pointer rounded-lg accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
      <div className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-lg bg-accent" style={{ width: `${progressPercent}%` }} aria-hidden="true" />
    </div>
  );
}
