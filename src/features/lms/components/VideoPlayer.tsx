"use client";

import * as React from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Video,
  Youtube,
  Settings,
  Sparkles,
} from "lucide-react";

export interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onProgress?: (progress: { currentTime: number; duration: number; percent: number }) => void;
  className?: string;
}

import { parseYouTubeUrl, detectVideoType } from "../videoUtils";

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
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  const [controlsVisible, setControlsVisible] = React.useState(true);

  const { type, embedUrl } = React.useMemo(() => detectVideoType(videoUrl), [videoUrl]);

  // Handle YouTube embed src with query params
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

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // HTML5 Video Event Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);
    setDuration(dur);

    if (onProgress && dur > 0) {
      onProgress({
        currentTime: curr,
        duration: dur,
        percent: Math.min(100, Math.round((curr / dur) * 100)),
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Exit fullscreen error:", err);
      });
      setIsFullscreen(false);
    }
  };

  // Hide controls on inactivity in HTML5 mode
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleMouseMove = () => {
      setControlsVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (isPlaying) setControlsVisible(false);
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      clearTimeout(timer);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [isPlaying]);

  // Render Empty Fallback
  if (type === "empty") {
    return (
      <div
        className={`relative aspect-video rounded-xl bg-ink text-white flex flex-col items-center justify-center p-6 border border-border shadow-lg ${className}`}
      >
        <Video className="w-12 h-12 text-ink-muted mb-3" />
        <p className="text-sm font-medium text-ink-muted">Dars videosi mavjud emas yoki havola berilmadi</p>
      </div>
    );
  }

  // Render YouTube Player Embed
  if (type === "youtube") {
    return (
      <div
        className={`relative aspect-video rounded-xl bg-ink overflow-hidden border border-border shadow-lg group ${className}`}
      >
        {/* Source Badge */}
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

  // Render HTML5 Player (MP4 / WebM / Custom Direct Stream)
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video rounded-xl bg-ink overflow-hidden border border-border shadow-lg group select-none ${className}`}
    >
      {/* Player Top Badges */}
      <div className="absolute top-3 right-3 z-20 bg-cream/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold text-ink border border-border flex items-center gap-1.5 shadow-sm">
        <Video className="w-3.5 h-3.5 text-accent" />
        <span>Direct MP4 Stream</span>
      </div>

      {title && (
        <div className="absolute top-3 left-3 z-20 bg-cream/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold text-ink border border-border max-w-[70%] truncate shadow-sm">
          {title}
        </div>
      )}

      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        autoPlay={autoPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Play/Pause Center Overlay Button */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] cursor-pointer transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
            <Play className="w-8 h-8 ml-1 fill-current" />
          </div>
        </div>
      )}

      {/* Custom Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent p-4 transition-opacity duration-300 ${
          controlsVisible || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrubber / Progress Slider */}
        <div className="relative mb-3 flex items-center group/scrubber">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-cream/30 rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
          />
          <div
            className="absolute left-0 top-0 h-1.5 bg-accent rounded-lg pointer-events-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls Actions Row */}
        <div className="flex items-center justify-between text-white text-xs font-mono">
          {/* Left: Play/Pause, Volume, Time */}
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-md hover:bg-cream/20 transition-colors"
              title={isPlaying ? "Pauza" : "Ijro etish"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, currentTime - 10);
                }
              }}
              className="p-1.5 rounded-md hover:bg-cream/20 transition-colors"
              title="10 sek orqaga"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-md hover:bg-cream/20 transition-colors"
                title={isMuted ? "Ovozsiz rejimdan chiqarish" : "Ovozsiz rejim"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-ink-muted" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-cream/30 rounded appearance-none cursor-pointer accent-accent opacity-70 group-hover/vol:opacity-100 transition-opacity"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-[11px] text-cream/90 font-medium">
              <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Playback Speed Menu, Fullscreen */}
          <div className="flex items-center space-x-2 relative">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1 rounded-md bg-cream/15 hover:bg-cream/25 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Settings className="w-3 h-3" />
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-8 z-40 bg-cream text-ink rounded-lg shadow-xl border border-border p-1 space-y-0.5 min-w-[90px]">
                  {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`w-full text-left px-3 py-1 rounded text-xs font-semibold hover:bg-cream-warm transition-colors ${
                        playbackSpeed === speed ? "text-accent bg-accent-soft" : "text-ink"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md hover:bg-cream/20 transition-colors"
              title={isFullscreen ? "Kichik ekranga o'tish" : "To'liq ekran"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
