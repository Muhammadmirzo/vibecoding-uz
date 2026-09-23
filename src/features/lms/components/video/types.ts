import type * as React from "react";

export interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onProgress?: (progress: { currentTime: number; duration: number; percent: number }) => void;
  className?: string;
}

export interface VideoController {
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  isFullscreen: boolean;
  showSpeedMenu: boolean;
  controlsVisible: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSpeedMenu: React.Dispatch<React.SetStateAction<boolean>>;
  togglePlay: () => void;
  handleTimeUpdate: () => void;
  handleSeek: React.ChangeEventHandler<HTMLInputElement>;
  handleVolumeChange: React.ChangeEventHandler<HTMLInputElement>;
  toggleMute: () => void;
  handleSpeedChange: (speed: number) => void;
  toggleFullscreen: () => void;
}
