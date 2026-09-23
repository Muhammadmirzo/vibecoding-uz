"use client";

import { useEffect, useState } from "react";
import type { AnalyticsData } from "@/features/crm/types";

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  useEffect(() => { let active = true; setLoading(true); fetch(`/api/admin/analytics?period=${period}`).then(async (res) => { if (!res.ok) throw new Error("Analitika ma'lumotlarini yuklab bo'lmadi"); return res.json(); }).then((data) => { if (active) setAnalytics(data); }).catch((err) => console.error("fetchAnalytics error:", err)).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [period]);
  return { analytics, loading, period, setPeriod };
}
