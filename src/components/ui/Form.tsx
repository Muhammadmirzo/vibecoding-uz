import * as React from "react";
import { cn } from "./utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) { return <label className={cn("mb-2 block text-sm font-semibold text-ink", className)} {...props} />; }
export function FieldError({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("mt-1 text-sm text-danger", className)} {...props}>{children}</p>; }
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn("h-12 w-full rounded-md border border-border-strong bg-bg-elevated px-4 text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand focus:ring-2 focus:ring-gold/30", className)} {...props} />);
Input.displayName = "Input";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => <textarea ref={ref} className={cn("min-h-32 w-full resize-y rounded-md border border-border-strong bg-bg-elevated px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand focus:ring-2 focus:ring-gold/30", className)} {...props} />);
Textarea.displayName = "Textarea";
