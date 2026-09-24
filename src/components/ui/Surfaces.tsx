import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", { variants: { variant: { default: "bg-accent-soft text-accent", gold: "bg-gold-soft text-ink", outline: "border border-border-strong text-ink-muted" } }, defaultVariants: { variant: "default" } });
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
export function Badge({ className, variant, ...props }: BadgeProps) { return <span className={cn(badgeVariants({ variant }), className)} {...props} />; }
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-xl border border-border bg-bg-elevated p-6 shadow-sm", className)} {...props} />; }
export function Stat({ label, value, detail, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { label: string; value: React.ReactNode; detail?: React.ReactNode }) { return <div className={cn("rounded-lg border border-border bg-bg-elevated p-5", className)} {...props}><p className="text-sm text-ink-muted">{label}</p><p className="mt-2 font-display text-3xl font-semibold text-brand">{value}</p>{detail && <p className="mt-1 text-sm text-ink-subtle">{detail}</p>}</div>; }
