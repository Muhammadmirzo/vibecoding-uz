import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

// One CTA shape sitewide: rounded-full pill, fixed heights per size (sm 40 / md 44 / lg 52px).
// `secondary` is kept as an alias of the outline treatment — there is only one
// secondary look across the site. `onBrand` is for buttons placed on a dark/
// brand surface (e.g. bg-brand-surface sections), where the ink-toned outline
// would disappear.
const buttonVariants = cva("btn-press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color,border-color,box-shadow,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50", { variants: { variant: { primary: "bg-gold text-on-gold shadow-sm hover:-translate-y-0.5 hover:bg-gold-hover hover:shadow-md", secondary: "border border-border-strong bg-transparent text-ink hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft", outline: "border border-border-strong bg-transparent text-ink hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft", onBrand: "border border-white/40 bg-transparent text-on-brand-surface hover:-translate-y-0.5 hover:border-white hover:bg-white/10", ghost: "text-ink-muted hover:bg-bg-sunken hover:text-ink", telegram: "bg-telegram-solid text-on-telegram hover:bg-telegram-hover" }, size: { sm: "min-h-10 px-4 text-sm", md: "min-h-11 px-5", lg: "min-h-[52px] px-7 text-base" } }, defaultVariants: { variant: "primary", size: "md" } });

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; href?: string; }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, href, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  if (href && !asChild) return <Link ref={ref as never} href={href} className={cn(buttonVariants({ variant, size }), className)} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{props.children}</Link>;
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";
export { buttonVariants };
