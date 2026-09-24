import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva("btn-press inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50", { variants: { variant: { primary: "bg-gold text-ink shadow-sm hover:-translate-y-0.5 hover:bg-gold-hover hover:shadow-md", secondary: "bg-brand text-white shadow-sm hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md", outline: "border border-border-strong bg-transparent text-ink hover:border-brand hover:bg-brand-soft", ghost: "text-ink-muted hover:bg-bg-sunken hover:text-ink", telegram: "bg-telegram text-white hover:bg-telegram-hover" }, size: { sm: "rounded-md px-3 text-sm", md: "rounded-lg px-5", lg: "rounded-xl px-6 text-base" } }, defaultVariants: { variant: "primary", size: "md" } });

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; href?: string; }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, href, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  if (href && !asChild) return <Link ref={ref as never} href={href} className={cn(buttonVariants({ variant, size }), className)} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{props.children}</Link>;
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";
export { buttonVariants };
