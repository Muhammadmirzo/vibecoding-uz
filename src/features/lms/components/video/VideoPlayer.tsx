"use client";

import * as React from "react";
import { Play, Video, Youtube } from "lucide-react";
import { detectVideoType, parseYouTubeUrl } from "../../videoUtils";
import { PlayerControls } from "./PlayerControls";
import { useVideoProgress } from "./useVideoProgress";
import type { VideoPlayerProps } from "./types";

export type { VideoPlayerProps } from "./types";
export { parseYouTubeUrl, detectVideoType };

export function VideoPlayer({
  videoUrl = "",
  title,
  poster,
  autoPlay = false,
  onEnded,
  onProgress,
  className = "",
}: VideoPlayerProps) {
  const controller = useVideoProgress();
  const { type, embedUrl } = React.useMemo(() => detectVideoType(videoUrl), [videoUrl]);

  const fullYouTubeSrc = React.useMemo(() => {
    if (!embedUrl) return "";
    const params = new URLSearchParams({
      autoplay: autoPlay ? "1" : "0",
      rel: "0",
      modestbranding: "1",
      enablejsapi: "1",
    });
    return `${embedUrl}?${params.toString()}`;
  }, [embedUrl, autoPlay]);

  const handleTimeUpdate = () => {
    controller.handleTimeUpdate();
    const video = controller.videoRef.current;
    if (!video) return;
    const currentTime = video.currentTime;
    const duration = video.duration || 0;
    if (onProgress && duration > 0) {
      onProgress({
        currentTime,
        duration,
        percent: Math.min(100, Math.round((currentTime / duration) * 100)),
      });
    }
  };

  if (type === "empty") {
    return (
      <div className={`relative aspect-video rounded-xl bg-ink text-white flex flex-col items-center justify-center p-6 border border-border shadow-lg ${className}`}>
        <Video className="w-12 h-12 text-ink-muted mb-3" />
        <p className="text-sm font-medium text-ink-muted">Dars videosi mavjud emas yoki havola berilmadi</p>
      </div>
    );
  }

  if (type === "youtube") {
    return (
      <div className={`relative aspect-video rounded-xl bg-ink overflow-hidden border border-border shadow-lg group ${className}`}>
        <div className="absolute top-3 right-3 z-10 bg-cream/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold text-ink border border-border flex items-center gap-1.5 shadow-sm">
          <Youtube className="w-3.5 h-3.5 text-accent" />
          <span>YouTube Player</span>
        </div>
        {title && (
          <div className="absolute top-3 left-3 z-10 bg-cream/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold text-ink border border-border max-w-[70%] truncate shadow-sm">
            {title}
          </div>
        )}
        <iframe
          src={fullYouTubeSrc}
          title={title || "Lesson Video"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      ref={controller.containerRef}
      className={`relative aspect-video rounded-xl bg-ink overflow-hidden border border-border shadow-lg group select-none ${className}`}
    >
      <div className="absolute top-3 right-3 z-20 bg-cream/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold text-ink border border-border flex items-center gap-1.5 shadow-sm">
        <Video className="w-3.5 h-3.5 text-accent" />
        <span>Direct MP4 Stream</span>
      </div>
      {title && (
        <div className="absolute top-3 left-3 z-20 bg-cream/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold text-ink border border-border max-w-[70%] truncate shadow-sm">
          {title}
        </div>
      )}
      <video
        ref={controller.videoRef}
        src={videoUrl}
        poster={poster}
        autoPlay={autoPlay}
        onPlay={() => controller.setIsPlaying(true)}
        onPause={() => controller.setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          controller.setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onClick={controller.togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />
      {!controller.isPlaying && (
        <div onClick={controller.togglePlay} className="absolute inset-0 z-10 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] cursor-pointer transition-opacity">
          <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
            <Play className="w-8 h-8 ml-1 fill-current" />
          </div>
        </div>
      )}
      <PlayerControls controller={controller} setShowSpeedMenu={controller.setShowSpeedMenu} />
    </div>
  );
}
