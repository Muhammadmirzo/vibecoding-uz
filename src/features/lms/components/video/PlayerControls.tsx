"use client";

import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw,
  Settings,
} from "lucide-react";
import type { VideoController } from "./types";
import { formatTime } from "./useVideoProgress";
import { ProgressBar } from "./ProgressBar";

interface PlayerControlsProps {
  controller: VideoController;
  setShowSpeedMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PlayerControls({ controller, setShowSpeedMenu }: PlayerControlsProps) {
  return (
    <div className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent p-2 transition-opacity duration-300 sm:p-4 ${controller.controlsVisible || !controller.isPlaying ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <ProgressBar controller={controller} />
      <div className="flex flex-wrap items-center justify-between gap-1 text-bg text-xs font-mono">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <button type="button" onClick={controller.togglePlay} aria-label={controller.isPlaying ? "Pauza" : "Ijro etish"} className="grid min-h-11 min-w-11 place-items-center rounded-md hover:bg-bg/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg">
            {controller.isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 fill-current" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => { if (controller.videoRef.current) controller.videoRef.current.currentTime = Math.max(0, controller.currentTime - 10); }} aria-label="10 sekund orqaga" className="grid min-h-11 min-w-11 place-items-center rounded-md hover:bg-bg/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-1">
            <button type="button" onClick={controller.toggleMute} aria-label={controller.isMuted ? "Ovozni yoqish" : "Ovozni o&apos;chirish"} className="grid min-h-11 min-w-11 place-items-center rounded-md hover:bg-bg/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg">
              {controller.isMuted || controller.volume === 0 ? <VolumeX className="h-4 w-4 text-ink-muted" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
            </button>
            <label className="sr-only" htmlFor="video-volume">Ovoz balandligi</label>
            <input id="video-volume" type="range" min={0} max={1} step={0.05} value={controller.isMuted ? 0 : controller.volume} onChange={controller.handleVolumeChange} className="h-11 w-16 cursor-pointer accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg sm:w-24" />
          </div>
          <div className="whitespace-nowrap text-[11px] text-bg/90 font-medium" aria-live="off">{formatTime(controller.currentTime)} / {formatTime(controller.duration)}</div>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button type="button" onClick={() => setShowSpeedMenu(!controller.showSpeedMenu)} aria-haspopup="menu" aria-expanded={controller.showSpeedMenu} aria-label="Ijro tezligini tanlash" className="flex min-h-11 items-center gap-1 rounded-md bg-bg/15 px-2.5 text-[11px] font-semibold hover:bg-bg/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg"><Settings className="h-3 w-3" aria-hidden="true" /><span>{controller.playbackSpeed}x</span></button>
            {controller.showSpeedMenu ? <div role="menu" aria-label="Ijro tezligi" className="absolute bottom-12 right-0 z-40 min-w-[90px] space-y-0.5 rounded-lg border border-border bg-bg-elevated p-1 text-ink shadow-xl">{[0.5, 1, 1.25, 1.5, 2].map((speed) => <button key={speed} type="button" role="menuitemradio" aria-checked={controller.playbackSpeed === speed} onClick={() => controller.handleSpeedChange(speed)} className={`min-h-11 w-full rounded px-3 text-left text-xs font-semibold hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${controller.playbackSpeed === speed ? "bg-accent-soft text-accent" : "text-ink"}`}>{speed}x</button>)}</div> : null}
          </div>
          <button type="button" onClick={controller.toggleFullscreen} aria-label={controller.isFullscreen ? "Kichik ekranga o&apos;tish" : "To&apos;liq ekran"} className="grid min-h-11 min-w-11 place-items-center rounded-md hover:bg-bg/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg">{controller.isFullscreen ? <Minimize className="h-4 w-4" aria-hidden="true" /> : <Maximize className="h-4 w-4" aria-hidden="true" />}</button>
        </div>
      </div>
    </div>
  );
}
