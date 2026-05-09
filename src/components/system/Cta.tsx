/**
 * <Cta> — the institute's button-as-link primitive.
 *
 * Two visual treatments:
 *   - "primary"   → solid terra fill, linen text, used for the single
 *                   highest-priority action on a page.
 *   - "secondary" → text + 1px terra underline, used everywhere else.
 *
 * NEVER use <button> styling for navigational links. CTAs route or submit
 * forms; they don't decorate.
 *
 *   <Cta href="/assessment/start">Begin the readiness assessment</Cta>
 *   <Cta variant="secondary" href="/about">Read the methodology</Cta>
 */

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface CtaProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  readonly href: string;
  readonly variant?: "primary" | "secondary";
  /** Tone for use inside dark bands — "dark" inverts the colors. */
  readonly tone?: "default" | "dark";
  readonly children: React.ReactNode;
}

export function Cta({ href, variant = "primary", tone = "default", className, children, ...rest }: CtaProps) {
  const isExternal = /^https?:\/\//.test(href);
  const Component: React.ElementType = isExternal ? "a" : Link;

  const base = "inline-block font-sans font-medium transition-colors duration-fast";

  let visual: string;
  if (variant === "primary") {
    visual =
      tone === "dark"
        ? "bg-bone text-terra px-s7 py-s4 rounded-sharp text-mono-sm uppercase tracking-wider hover:bg-cream"
        : "bg-terra text-linen px-s7 py-s4 rounded-sharp text-mono-sm uppercase tracking-wider hover:bg-terra-light";
  } else {
    visual =
      tone === "dark"
        ? "text-bone border-b border-bone pb-[2px] text-body-md hover:text-cream hover:border-cream"
        : "text-terra border-b border-terra pb-[2px] text-body-md hover:text-terra-light hover:border-terra-light";
  }

  return (
    <Component href={href} className={cn(base, visual, className)} {...rest}>
      {children}
    </Component>
  );
}
