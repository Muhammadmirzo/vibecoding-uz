"use client";

import { useEffect } from "react";
import { afterPageReady } from "./after-page-ready";

export function AnalyticsTracker() {
  useEffect(() => afterPageReady(() => {
    void import("./tracker").then((module) => module.startAnalyticsTracker());
  }), []);
  return null;
}
