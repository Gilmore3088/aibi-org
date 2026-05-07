/**
 * <NewsletterCard> — subscribe primitive for the AI Banking Brief.
 *
 * A compact, parch-dark surface with label, headline, blurb, email field, and
 * submit. Lives in the footer, on /research, and inline at end of essays.
 *
 * Rendered as a client form that submits to /api/subscribe-newsletter. The
 * server-side route preserves the existing CONVERTKIT integration.
 */

"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils/cn";

export interface NewsletterCardProps {
  readonly heading?: string;
  readonly blurb?: string;
  /** Optional shape for proof line, e.g. "340+ subscribers". */
  readonly proof?: string;
  readonly className?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterCard({
  heading = "Join the operator list.",
  blurb = "The AI Banking Brief — sourced commentary on how community institutions are actually adopting AI.",
  proof,
  className,
}: NewsletterCardProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email.");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
      setMessage("Subscribed. The next issue lands in your inbox.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Subscribe failed. Try again in a minute.");
    }
  }

  return (
    <aside
      className={cn(
        "border border-hairline bg-parch-dark p-s6",
        className
      )}
      aria-label="Subscribe to the AI Banking Brief"
    >
      <p className="font-mono text-label-sm uppercase tracking-widest text-slate mb-s3">
        Subscribe
      </p>
      <h3 className="font-serif text-display-xs leading-snug mb-s2">{heading}</h3>
      <p className="text-body-sm text-ink/75 mb-s4 leading-relaxed">{blurb}</p>
      <form onSubmit={onSubmit} className="grid grid-cols-[1fr_auto] gap-s2">
        <label className="sr-only" htmlFor="newsletter-email">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourbank.com"
          className="border border-hairline bg-linen px-s3 py-s2 text-body-sm font-sans rounded-sharp focus:border-terra focus:outline-none"
          disabled={status === "submitting" || status === "success"}
        />
        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="bg-terra text-linen px-s5 py-s2 rounded-sharp font-sans font-medium text-mono-sm uppercase tracking-wider hover:bg-terra-light transition-colors duration-fast disabled:opacity-60"
        >
          {status === "submitting" ? "..." : status === "success" ? "Done" : "Subscribe"}
        </button>
      </form>
      {message && (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "mt-s3 font-mono text-mono-sm",
            status === "error" ? "text-error" : "text-slate"
          )}
        >
          {message}
        </p>
      )}
      {proof && status !== "success" && (
        <p className="mt-s3 font-mono text-mono-sm tabular-nums text-slate">{proof}</p>
      )}
    </aside>
  );
}
