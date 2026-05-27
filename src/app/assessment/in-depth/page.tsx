// /assessment/in-depth — landing for the paid 48-question In-Depth Assessment.
//
// Sells the $99 In-Depth as the recommended path. The free 12-question scan
// is positioned as the "curious browser" alternative inside a side-by-side
// comparison that doubles as the buying surface — no duplicate pricing
// blocks below.
//
// Pricing per Plans/aibi-launch-spec-v2.md §1b: $99 individual; $79/seat
// at 10+ by email request. Self-serve team checkout is deferred — the
// in-depth checkout route returns 503 for mode='institution' and nudges
// buyers to email hello@aibankinginstitute.com.

import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient as ssrCreateServerClient } from "@supabase/ssr";
import { MarketingPage } from "@/components/system/templates";
import { Section } from "@/components/system";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { BRAND } from "@content/copy";
import { PurchaseButton } from "./_components/PurchaseButton";

export const dynamic = "force-dynamic";

async function getSignedInEmail(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = await cookies();
    const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  alternates: { canonical: '/assessment/in-depth' },
  title: "In-Depth Assessment | The AI Banking Institute",
  description:
    "A 48-question, eight-dimension diagnostic for community banks and credit unions. Individual report plus an anonymized aggregate dashboard for institution leaders.",
};

interface InDepthAssessmentPageProps {
  readonly searchParams?: { readonly reason?: string };
}

// Comparison rows — same labels run down both columns so eyes scan across.
// Order matters: lead with the things the In-Depth wins on.
const COMPARE_ROWS: ReadonlyArray<{
  readonly label: string;
  readonly free: string;
  readonly inDepth: string;
}> = [
  { label: "Questions", free: "12", inDepth: "48" },
  { label: "Time", free: "3 minutes", inDepth: "20 minutes" },
  { label: "Output", free: "Score + tier", inDepth: "Full written report" },
  { label: "Eight readiness dimensions", free: "Headline only", inDepth: "Each scored, each explained" },
  { label: "Peer-band comparison", free: "—", inDepth: "Yes — vs banks your size" },
  { label: "Ninety-day playbook", free: "—", inDepth: "Keyed to your weakest dimension" },
  { label: "Institution rollup dashboard", free: "—", inDepth: "Anonymized aggregate for leaders" },
  { label: "Free retake", free: "Anytime", inDepth: "One within twelve months" },
];

export default async function InDepthAssessmentPage({
  searchParams,
}: InDepthAssessmentPageProps) {
  const noPurchase = searchParams?.reason === "no-purchase";
  const signedInEmail = await getSignedInEmail();

  return (
    <MarketingPage
      hero={{
        eyebrow: "In-Depth Assessment",
        title: (
          <>
            The <span className="text-gold">board-ready</span> diagnostic for your
            institution.
          </>
        ),
        lede: (
          <span>
            Forty-eight questions. Twenty minutes. Eight readiness dimensions.
            A written report you can take to your board on Monday.
          </span>
        ),
        payload: (
          <div className="flex flex-wrap items-center gap-s6">
            <PurchaseButton
              userEmail={signedInEmail ?? undefined}
              label="PURCHASE IN-DEPTH · $99"
              pendingLabel="Starting checkout…"
              size="hero"
            />
            <a
              href="#compare"
              className="font-mono text-mono-sm uppercase tracking-widest text-ink border-b border-ink hover:text-gold hover:border-gold"
            >
              COMPARE WITH THE FREE SCAN →
            </a>
          </div>
        ),
        divider: "hairline",
      }}
    >
      {noPurchase && (
        <Section variant="parch" padding="default" divider="none">
          <div
            role="status"
            className="mx-auto max-w-default border border-gold/30 bg-gold/5 px-s6 py-s5 rounded-sharp"
          >
            <p className="font-mono text-mono-sm uppercase tracking-widest text-gold mb-s2">
              Purchase required
            </p>
            <p className="text-body-md text-ink leading-relaxed">
              The forty-eight-question In-Depth Assessment is paid. Purchase a
              seat below to open it. Already paid? Make sure you are signed
              in with the same email you used at checkout.
            </p>
          </div>
        </Section>
      )}

      {/* COMPARE + BUY — single surface. Free column is the quiet alternative;
          In-Depth column is the gold-trimmed recommended path with the
          deliverables, pricing, and CTA all stacked inside it. */}
      <Section id="compare" variant="linen" padding="default" divider="none">
        <div className="max-w-default mx-auto">
          <p className="font-mono text-label-md uppercase tracking-widest text-gold mb-s3">
            Two ways in
          </p>
          <h2 className="text-display-sm md:text-display-md text-ink leading-[1.05] tracking-tight mb-s4 max-w-[22ch] font-bold">
            Curious, or <span className="text-gold">deciding</span>?
          </h2>
          <p className="text-body-lg text-ink/75 max-w-[52ch] mb-s10">
            The free scan tells you roughly where you stand. The In-Depth
            tells you what to do about it — and gives you a document to hand
            your CEO, your board, or your examiner.
          </p>

          <div id="purchase" className="grid lg:grid-cols-[1fr_1.35fr] gap-s5 items-stretch">
            {/* FREE — the curious browser */}
            <article className="border border-hairline bg-paper p-s7 md:p-s8 flex flex-col">
              <p className="font-mono text-mono-xs uppercase tracking-widest text-slate mb-s3">
                For the curious
              </p>
              <h3 className="text-h2 text-ink leading-tight mb-s2 font-bold">
                Free Readiness Scan
              </h3>
              <p className="text-body-md text-ink/75 mb-s5 max-w-[34ch]">
                Twelve questions. Three minutes. A score and a tier — enough
                to know which conversation to start at your bank.
              </p>
              <p className="font-mono text-display-sm tabular-nums text-ink leading-none mb-s5 font-bold">
                Free
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center px-s5 py-s3 border border-ink text-ink font-mono text-mono-sm uppercase tracking-widest hover:bg-ink hover:text-linen transition-colors rounded-sharp text-center"
              >
                TAKE THE FREE SCAN →
              </Link>
              <p className="font-mono text-mono-xs uppercase tracking-wider text-slate mt-s4">
                No account required
              </p>
            </article>

            {/* IN-DEPTH — recommended, gold-bordered, fully loaded */}
            <article className="relative border-2 border-gold bg-paper p-s7 md:p-s8 flex flex-col shadow-[0_18px_44px_-32px_rgba(14,27,45,0.32)]">
              <span className="absolute -top-[14px] left-s6 bg-gold text-linen font-mono text-mono-xs uppercase tracking-widest px-s3 py-s1 rounded-sharp">
                Recommended
              </span>
              <p className="font-mono text-mono-xs uppercase tracking-widest text-gold mb-s3">
                For decision-makers
              </p>
              <h3 className="text-h2 text-ink leading-tight mb-s2 font-bold">
                In-Depth Assessment
              </h3>
              <p className="text-body-md text-ink/80 mb-s5 max-w-[42ch]">
                Forty-eight questions across eight dimensions. A written
                report with peer-band comparison and a ninety-day playbook
                keyed to your weakest area.
              </p>

              <div className="flex items-baseline gap-s4 mb-s5">
                <p className="font-mono text-display-md tabular-nums text-ink leading-none font-bold">
                  $99
                </p>
                <p className="font-mono text-mono-xs uppercase tracking-widest text-slate">
                  per individual
                  <br />
                  <span className="text-ink/60">
                    $79/seat at 10+ · by request
                  </span>
                </p>
              </div>

              <PurchaseButton userEmail={signedInEmail ?? undefined} />

              <p className="font-mono text-mono-xs uppercase tracking-wider text-slate mt-s4">
                Pay once · Report in 20 min · One free retake within 12 months
              </p>

              <div className="mt-s7 pt-s5 border-t border-hairline">
                <p className="font-mono text-mono-xs uppercase tracking-widest text-gold mb-s4">
                  What&apos;s in the report
                </p>
                <ul className="space-y-s3">
                  {[
                    "Forty-eight questions across eight readiness dimensions",
                    "A full individual report with peer-band comparison",
                    "A starting playbook keyed to your lowest-scoring dimensions",
                    "Anonymized aggregate dashboard for institution leaders",
                  ].map((item) => (
                    <li
                      key={item}
                      className="grid grid-cols-[1.25rem_1fr] gap-s2 items-start text-body-md text-ink leading-snug"
                    >
                      <span aria-hidden="true" className="text-gold pt-[2px]">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </Section>

      {/* DETAILED COMPARE — side-by-side ledger table */}
      <Section variant="parch" padding="default" divider="none">
        <div className="max-w-default mx-auto">
          <p className="font-mono text-label-md uppercase tracking-widest text-gold mb-s3">
            What you get, line by line
          </p>
          <h2 className="text-h1 text-ink leading-tight tracking-tight mb-s8 max-w-[22ch] font-bold">
            Free vs. <span className="text-gold">In-Depth.</span>
          </h2>

          <div className="border border-hairline bg-paper">
            <div className="grid grid-cols-[1.4fr_1fr_1.2fr] border-b-2 border-ink">
              <div className="p-s5"></div>
              <div className="p-s5 border-l border-hairline">
                <p className="font-mono text-mono-xs uppercase tracking-widest text-slate">
                  Free
                </p>
                <p className="text-h3 text-ink mt-s1 font-semibold">Readiness Scan</p>
              </div>
              <div className="p-s5 border-l border-hairline bg-gold/5">
                <p className="font-mono text-mono-xs uppercase tracking-widest text-gold">
                  $99 · Recommended
                </p>
                <p className="text-h3 text-ink mt-s1 font-semibold">
                  In-Depth <span className="text-gold">Assessment</span>
                </p>
              </div>
            </div>

            {COMPARE_ROWS.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1.4fr_1fr_1.2fr] ${
                  idx < COMPARE_ROWS.length - 1 ? "border-b border-hairline" : ""
                }`}
              >
                <div className="p-s5 font-mono text-mono-sm uppercase tracking-widest text-ink/80">
                  {row.label}
                </div>
                <div className="p-s5 border-l border-hairline text-body-md text-ink/70">
                  {row.free}
                </div>
                <div className="p-s5 border-l border-hairline bg-gold/5 text-body-md text-ink">
                  {row.inDepth}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-[1.4fr_1fr_1.2fr] border-t-2 border-ink">
              <div className="p-s5"></div>
              <div className="p-s5 border-l border-hairline">
                <Link
                  href="/assessment"
                  className="font-mono text-mono-sm uppercase tracking-widest text-ink border-b border-ink hover:text-gold hover:border-gold"
                >
                  TAKE THE FREE SCAN →
                </Link>
              </div>
              <div className="p-s5 border-l border-hairline bg-gold/5">
                <PurchaseButton
                  userEmail={signedInEmail ?? undefined}
                  label="PURCHASE IN-DEPTH · $99"
                  pendingLabel="Starting checkout…"
                  size="compact"
                />
              </div>
            </div>
          </div>

          <p className="text-body-md text-ink/75 mt-s6 max-w-[60ch]">
            Want your whole team to benefit? Per-seat pricing of $79/seat opens
            at ten or more. Email{" "}
            <a
              href={`mailto:${BRAND.emails.contact}?subject=In-Depth%20Assessment%20%E2%80%94%2010%2B%20seats`}
              className="text-gold border-b border-gold hover:text-gold-2 hover:border-gold-2"
            >
              {BRAND.emails.contact}
            </a>{" "}
            to set it up.
          </p>
        </div>
      </Section>

    </MarketingPage>
  );
}
