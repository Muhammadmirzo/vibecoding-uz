import * as React from "react";
import { resolveMotionFlags, type MotionSettings } from "../domain/settings";

function onOff(value: boolean): "on" | "off" {
  return value ? "on" : "off";
}

/**
 * Attribute set mirrored onto `<html>` so CSS and client islands can read
 * the motion configuration without any client-side fetch:
 * `data-motion="off|subtle|full"` + one `data-motion-<flag>` per slice.
 */
export function motionHtmlAttributes(settings: MotionSettings) {
  const flags = resolveMotionFlags(settings);
  return {
    "data-motion": settings.level,
    "data-motion-hero": onOff(flags.heroIntro),
    "data-motion-scroll": onOff(flags.scrollReveal),
    "data-motion-pointer": onOff(flags.pointerEffects),
    "data-motion-ambient": onOff(flags.ambient),
    "data-motion-page": onOff(flags.pageTransitions),
  };
}

interface MotionRootProps {
  settings: MotionSettings;
  className?: string;
  children: React.ReactNode;
}

/**
 * Server-friendly root: renders the `<html>` element itself with the motion
 * attributes, so the first paint already carries the right configuration.
 * No client JavaScript.
 */
export function MotionRoot({ settings, className, children }: MotionRootProps) {
  const attrs = motionHtmlAttributes(settings);
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={className}
      data-motion={attrs["data-motion"]}
      data-motion-hero={attrs["data-motion-hero"]}
      data-motion-scroll={attrs["data-motion-scroll"]}
      data-motion-pointer={attrs["data-motion-pointer"]}
      data-motion-ambient={attrs["data-motion-ambient"]}
      data-motion-page={attrs["data-motion-page"]}
    >
      {children}
    </html>
  );
}
