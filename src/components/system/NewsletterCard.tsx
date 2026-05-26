/**
 * <NewsletterCard> — subscribe primitive for The AI Banking Brief.
 *
 * A compact, parch-dark surface with label, headline, blurb, email field, and
 * submit. Lives in the footer, on /research, and inline at end of essays.
 *
 * Submits as JSON to /api/subscribe-newsletter — the server writes to
 * Supabase (owned-data backup) and MailerLite (primary list). See #190.
 *
 * Spam mitigation: hidden honeypot field (`companyUrl`). Bots fill every
 * field; the server treats a non-empty honeypot as a silent accept (no
 * subscriber recorded). Real users never see it.
 */

"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { trackBriefSubscribed } from "@/lib/analytics/events";

export interface NewsletterCardProps {
  readonly heading?: string;
  readonly blurb?: string;
  /** Optional shape for proof line, e.g. "340+ subscribers". */
  readonly proof?: string;
  /** Where this form is rendered — used for analytics attribution. */
  readonly source?: 'footer' | 'research' | 'essay' | 'home';
  readonly className?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterCard({
  heading = "Join the operator list.",
  blurb = "The AI Banking Brief — sourced commentary on how community institutions are actually adopting AI.",
  proof,
  source = 'footer',
  className,
}: NewsletterCardProps) {
  const [email, setEmail] = useState("");
  const [companyUrl, setCompanyUrl] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, companyUrl }),
      });
      if (!res.ok) {
        // Read the friendly error from the server body when available.
        // Never surface raw response codes to users.
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.status === 429) {
          throw new Error('Too many attempts. Please try again in a minute.');
        }
        throw new Error(data.error ?? 'Something went wrong. Please try again.');
      }
      setStatus("success");
      setMessage("You're on the list. The next AI Banking Brief lands in your inbox.");
      setEmail("");
      trackBriefSubscribed({ source });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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
          className="border border-hairline bg-linen px-s3 py-s2 text-body-sm font-sans rounded-sharp focus:border-gold focus:outline-none"
          disabled={status === "submitting" || status === "success"}
        />
        {/* Honeypot — bots fill every field, humans don't see this.
            Hidden visually and from assistive tech. The server treats a
            non-empty value as a silent-accept bot submission. */}
        <input
          type="text"
          name="company_url"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
          className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
        />
        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="bg-gold text-linen px-s5 py-s2 rounded-sharp font-sans font-medium text-mono-sm uppercase tracking-wider hover:bg-gold-2 transition-colors duration-fast disabled:opacity-60"
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
