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
    <div
      className={`absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent p-4 transition-opacity duration-300 ${
        controller.controlsVisible || !controller.isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <ProgressBar controller={controller} />
      <div className="flex items-center justify-between text-bg text-xs font-mono">
        <div className="flex items-center space-x-3">
          <button onClick={controller.togglePlay} className="p-1.5 rounded-md hover:bg-bg/20 transition-colors" title={controller.isPlaying ? "Pauza" : "Ijro etish"}>
            {controller.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button
            onClick={() => {
              if (controller.videoRef.current) {
                controller.videoRef.current.currentTime = Math.max(0, controller.currentTime - 10);
              }
            }}
            className="p-1.5 rounded-md hover:bg-bg/20 transition-colors"
            title="10 sek orqaga"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-1.5 group/vol">
            <button onClick={controller.toggleMute} className="p-1.5 rounded-md hover:bg-bg/20 transition-colors" title={controller.isMuted ? "Ovozsiz rejimdan chiqarish" : "Ovozsiz rejim"}>
              {controller.isMuted || controller.volume === 0 ? <VolumeX className="w-4 h-4 text-ink-muted" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={controller.isMuted ? 0 : controller.volume}
              onChange={controller.handleVolumeChange}
              className="w-16 h-1 bg-bg/30 rounded appearance-none cursor-pointer accent-accent opacity-70 group-hover/vol:opacity-100 transition-opacity"
            />
          </div>
          <div className="text-[11px] text-bg/90 font-medium">
            <span>{formatTime(controller.currentTime)}</span> / <span>{formatTime(controller.duration)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative">
          <div className="relative">
            <button onClick={() => setShowSpeedMenu(!controller.showSpeedMenu)} className="px-2.5 py-1 rounded-md bg-bg/15 hover:bg-bg/25 text-[11px] font-semibold flex items-center gap-1 transition-colors">
              <Settings className="w-3 h-3" />
              <span>{controller.playbackSpeed}x</span>
            </button>
            {controller.showSpeedMenu && (
              <div className="absolute right-0 bottom-8 z-40 bg-bg-elevated text-ink rounded-lg shadow-xl border border-border p-1 space-y-0.5 min-w-[90px]">
                {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => controller.handleSpeedChange(speed)}
                    className={`w-full text-left px-3 py-1 rounded text-xs font-semibold hover:bg-bg-elevated-warm transition-colors ${
                      controller.playbackSpeed === speed ? "text-accent bg-accent-soft" : "text-ink"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={controller.toggleFullscreen} className="p-1.5 rounded-md hover:bg-bg/20 transition-colors" title={controller.isFullscreen ? "Kichik ekranga o'tish" : "To'liq ekran"}>
            {controller.isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
