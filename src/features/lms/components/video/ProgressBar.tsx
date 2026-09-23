"use client";

import type { VideoController } from "./types";

interface ProgressBarProps {
  controller: VideoController;
}

export function ProgressBar({ controller }: ProgressBarProps) {
  const progressPercent = controller.duration > 0
    ? (controller.currentTime / controller.duration) * 100
    : 0;

  return (
    <div className="relative mb-3 flex items-center group/scrubber">
      <input
        type="range"
        min={0}
        max={controller.duration || 100}
        step={0.1}
        value={controller.currentTime}
        onChange={controller.handleSeek}
        className="w-full h-1.5 bg-cream/30 rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
      />
      <div
        className="absolute left-0 top-0 h-1.5 bg-accent rounded-lg pointer-events-none"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
}
