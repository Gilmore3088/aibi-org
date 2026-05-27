// YourWorkStrip — three thumbnail cards showing the artifacts THIS
// learner has produced (saved prompts count, reviewed work product
// status, Acceptable Use card status).
//
// Audit §2 item 2. For week-one learners the cards show empty-state
// placeholders that describe what will eventually fill the slot.
//
// TODO: wire real artifact data — these counts/statuses currently
// derive only from the completed-module set. The real source lives
// in Supabase tables (saved_prompts, work_product_submissions,
// acceptable_use_card). The follow-up wires them; the UI structure
// is intentionally shaped so swap-in is mechanical.

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface WorkSlot {
  readonly kicker: string;
  readonly title: string;
  readonly status: string;
  readonly statusTone: 'empty' | 'progress' | 'done';
  readonly hint: string;
}

interface YourWorkStripProps {
  readonly completedModules: readonly number[];
}

function deriveSlots(completed: readonly number[]): readonly WorkSlot[] {
  // Heuristic placeholders until the artifact tables are wired. Module 3
  // is "saved prompts", Module 7 is the reviewed work product, Module 1
  // is the Acceptable Use card.
  const hasSavedPrompts = completed.includes(3);
  const hasWorkProduct = completed.includes(7);
  const hasUseCard = completed.includes(1);

  return [
    {
      kicker: 'Saved prompts',
      title: hasSavedPrompts ? '3 saved prompts' : 'No prompts saved yet',
      status: hasSavedPrompts ? 'Library in progress' : 'Empty',
      statusTone: hasSavedPrompts ? 'progress' : 'empty',
      hint: hasSavedPrompts
        ? 'Last edited in Module 3.'
        : 'Save your first prompt in Module 3.',
    },
    {
      kicker: 'Reviewed work product',
      title: hasWorkProduct ? 'BSA narrative draft' : 'Work product not started',
      status: hasWorkProduct ? 'In review' : 'Not started',
      statusTone: hasWorkProduct ? 'progress' : 'empty',
      hint: hasWorkProduct
        ? 'Reviewer feedback returns within two business days.'
        : 'You will submit one reviewed work product in Module 7.',
    },
    {
      kicker: 'Acceptable Use card',
      title: hasUseCard ? 'Acceptable Use card · drafted' : 'Acceptable Use card',
      status: hasUseCard ? 'Drafted' : 'Not started',
      statusTone: hasUseCard ? 'progress' : 'empty',
      hint: hasUseCard
        ? 'Submit for institution approval when ready.'
        : 'You draft this in Module 1.',
    },
  ];
}

function statusPillStyle(tone: WorkSlot['statusTone']): React.CSSProperties {
  if (tone === 'done') {
    return {
      background: 'var(--emerald-700)',
      color: 'var(--cream)',
    };
  }
  if (tone === 'progress') {
    return {
      background: 'var(--ink)',
      color: 'var(--gold-soft)',
    };
  }
  return {
    background: 'var(--slate-100)',
    color: 'var(--slate-500)',
  };
}

export function YourWorkStrip({ completedModules }: YourWorkStripProps) {
  const slots = deriveSlots(completedModules);

  return (
    <section
      style={{
        marginBottom: 40,
        fontFamily: FONT_INTER,
      }}
      aria-labelledby="your-work-heading"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h2
          id="your-work-heading"
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          Your work
        </h2>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
          }}
        >
          Artifacts you have produced
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {slots.map((slot) => (
          <article
            key={slot.kicker}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--slate-200)',
              borderRadius: 16,
              padding: '20px 20px 18px',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              minHeight: 148,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              {slot.kicker}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1.3,
              }}
            >
              {slot.title}
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  ...statusPillStyle(slot.statusTone),
                }}
              >
                {slot.status}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--slate-600)',
              }}
            >
              {slot.hint}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
