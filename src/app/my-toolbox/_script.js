const dbg = document.getElementById('dbg');
  const dr  = document.getElementById('drawer');
  const close = () => { dr.classList.remove('open'); dbg.classList.remove('open'); };
  dbg.addEventListener('click', close);
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // tile clicks are wired by the per-tool openDrawerFor() in the next script block

  // ===== Type filter + search wiring =====
  // Each typecard's t-* class doubles as the filter key (t-p/t-s/t-a/t-pb).
  // Clicking a typecard toggles its filter; clicking the same card again
  // clears (shows all). Search is a substring match on the visible title.
  // Type + search compose: both must match for a tile to remain visible.
  let activeType = null;          // 't-p' | 't-s' | 't-a' | 't-pb' | null
  let searchQuery = '';

  function typeKey(el){
    return ['t-p','t-s','t-a','t-pb'].find(k => el.classList.contains(k)) || null;
  }
  function applyFilters(){
    const tiles = document.querySelectorAll('.shelf .tile, .grid .tile');
    const q = searchQuery.trim().toLowerCase();
    let hiddenCount = 0;
    tiles.forEach(tile => {
      const tk = typeKey(tile);
      const titleEl = tile.querySelector('h3');
      const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
      const typeOk = !activeType || tk === activeType;
      const searchOk = !q || titleText.includes(q);
      const show = typeOk && searchOk;
      tile.style.display = show ? '' : 'none';
      if (!show) hiddenCount += 1;
    });
    // Update the right-aligned counter on the "All your assets" header.
    const moreCounter = document.querySelector('.sec-h .l');
    // (left intentionally untouched — it's the "23 runs this week" label, not a counter)
    // Update the "43 more" header instead:
    const allHdrs = document.querySelectorAll('.sec-h');
    allHdrs.forEach(h => {
      const l = h.querySelector('.l');
      if (l && /more$/.test(l.textContent.trim())){
        const visibleGrid = h.parentElement.querySelectorAll('.grid .tile:not([style*="display: none"])').length;
        l.textContent = visibleGrid + ' more';
      }
    });
  }
  document.querySelectorAll('.typecard').forEach(b => b.addEventListener('click', () => {
    const tk = typeKey(b);
    if (activeType === tk){
      activeType = null;
      document.querySelectorAll('.typecard').forEach(x => x.classList.remove('sel'));
    } else {
      activeType = tk;
      document.querySelectorAll('.typecard').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel');
    }
    applyFilters();
  }));
  const askInput = document.getElementById('askInput');
  if (askInput){
    askInput.addEventListener('input', e => {
      searchQuery = e.target.value || '';
      applyFilters();
    });
  }
  document.getElementById('askForm').addEventListener('submit', e => {
    e.preventDefault();
    applyFilters();
    const visibleTiles = document.querySelectorAll('.shelf .tile:not([style*="display: none"]), .grid .tile:not([style*="display: none"])');
    if (visibleTiles.length === 1){
      const item = visibleTiles[0].dataset.item;
      if (item && typeof openDrawerFor === 'function') openDrawerFor(item);
    }
  });
  // Initialize filter state from the markup's pre-selected typecard.
  const presel = document.querySelector('.typecard.sel');
  if (presel){
    activeType = typeKey(presel);
    applyFilters();
  }

  // ===== Sort dropdown =====
  // The "All your assets" header has a <select> with three options.
  // Reorder the grid tiles in place based on the selected option.
  const sortSel = document.querySelector('.sec-h .right select');
  if (sortSel){
    sortSel.addEventListener('change', () => {
      const grid = document.querySelector('.grid');
      if (!grid) return;
      const tiles = Array.from(grid.querySelectorAll('.tile'));
      const opt = sortSel.value;
      const filledRuns = (t) => t.querySelectorAll('.runs .b.f').length;
      const title = (t) => (t.querySelector('h3')?.textContent || '').trim().toLowerCase();
      let sorted;
      if (/most/i.test(opt))      sorted = tiles.sort((a,b) => filledRuns(b) - filledRuns(a));
      else if (/a.?z/i.test(opt)) sorted = tiles.sort((a,b) => title(a).localeCompare(title(b)));
      else                        sorted = tiles.sort((a,b) => (a.dataset.idx || 0) - (b.dataset.idx || 0));
      sorted.forEach(t => grid.appendChild(t));
    });
    // Stash original order so "Recently used" can restore it.
    document.querySelectorAll('.grid .tile').forEach((t, i) => { t.dataset.idx = String(i); });
  }

  // ===== Role switcher =====
  // The role button (".role") cycles through the four kit roles. Clicking
  // it opens an inline popover listing roles; selecting one updates the
  // label and visually marks the matching kit card as active.
  const roleBtn = document.querySelector('.role');
  if (roleBtn){
    const ROLES = ['BSA officer', 'Lender', 'Branch manager', 'Compliance'];
    const KIT_MAP = { 'BSA officer': null, 'Lender': 'lender', 'Branch manager': 'bm', 'Compliance': 'compl' };
    roleBtn.style.position = 'relative';
    roleBtn.addEventListener('click', e => {
      e.stopPropagation();
      // Build / toggle popover
      let pop = document.getElementById('rolePop');
      if (pop){ pop.remove(); return; }
      pop = document.createElement('div');
      pop.id = 'rolePop';
      pop.style.cssText = 'position:absolute;top:24px;left:0;background:#FAF7EE;border:1px solid var(--ink);box-shadow:0 8px 20px rgba(14,27,45,0.16);z-index:40;min-width:180px';
      ROLES.forEach(r => {
        const row = document.createElement('button');
        row.type = 'button';
        row.textContent = r;
        row.style.cssText = 'display:block;width:100%;text-align:left;padding:10px 14px;font-family:var(--mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-2);font-weight:700;background:transparent;border:none;border-bottom:1px solid var(--rule);cursor:pointer';
        row.addEventListener('mouseenter', () => row.style.background = 'var(--paper-2)');
        row.addEventListener('mouseleave', () => row.style.background = 'transparent');
        row.addEventListener('click', ev => {
          ev.stopPropagation();
          roleBtn.innerHTML = '<span class="dot"></span>' + r + ' ▾';
          // Re-mark active kit
          document.querySelectorAll('.kit').forEach(k => k.classList.remove('active'));
          document.querySelectorAll('.kit .active-pill').forEach(p => p.remove());
          document.querySelectorAll('.kit .cta').forEach(c => { c.textContent = 'Adopt kit →'; c.style.color = ''; });
          const kitKey = KIT_MAP[r];
          let target;
          if (kitKey === null){
            target = document.querySelector('.kit'); // first kit = BSA officer
          } else {
            target = document.querySelector('.kit[data-kit="' + kitKey + '"]');
          }
          if (target){
            target.classList.add('active');
            const cap = target.querySelector('.kicap');
            if (cap && !cap.querySelector('.active-pill')){
              const pill = document.createElement('span');
              pill.className = 'active-pill';
              pill.textContent = '★ Active';
              cap.appendChild(pill);
            }
            const cta = target.querySelector('.cta');
            if (cta){ cta.textContent = 'In your toolbox ✓'; cta.style.color = 'var(--green)'; }
          }
          pop.remove();
          showToast('Active desk: ' + r);
        });
        pop.appendChild(row);
      });
      roleBtn.appendChild(pop);
    });
    document.addEventListener('click', () => { const p = document.getElementById('rolePop'); if (p) p.remove(); });
  }

  // Action button: don't trigger tile click
  document.querySelectorAll('[data-stop]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); showToast(b.title || 'Action'); }));

  // Copy link toast
  document.querySelectorAll('[data-copylink]').forEach(b => b.addEventListener('click', e => {
    const input = b.parentElement.querySelector('input');
    if (input) { input.select(); try { navigator.clipboard.writeText(input.value); } catch(_){} }
    showToast('Link copied');
  }));

  // Export buttons
  document.querySelectorAll('.exp-btn').forEach(b => b.addEventListener('click', e => {
    const fmt = b.querySelector('b')?.textContent || 'file';
    showToast('Exported as ' + fmt);
  }));

  // Add-to-my-toolbox on shared-with-you tiles
  document.querySelectorAll('.swyt').forEach(t => t.addEventListener('click', e => {
    showToast('Added to your toolbox');
  }));

  // Toast helper
  let toastTimer;
  function showToast(msg){
    let el = document.getElementById('__toast');
    if (!el) { el = document.createElement('div'); el.id = '__toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  // Starter-kit adoption
  document.querySelectorAll('.kit:not(.active)').forEach(k => k.addEventListener('click', () => showToast('Kit adopted to your toolbox')));
  document.querySelector('.kit.active')?.addEventListener('click', () => showToast('Kit already in your toolbox'));



/* ===== block 2 ===== */

  // ============== TOOLS DATA — 12 tools fully wired ==============
  const TYPE_LABELS = { p:'Prompt', s:'Skill', a:'Agent', pb:'Playbook' };

  // Helper for labelled row preview
  function rowsHTML(rows, accentColor){
    return rows.map((r, i) => {
      const isLast = i === rows.length - 1;
      const labCol = (r.accent && accentColor) ? accentColor : 'var(--muted)';
      return `<div style="display:grid;grid-template-columns:90px 1fr;gap:14px;align-items:baseline;padding-bottom:6px;${!isLast ? 'border-bottom:1px dashed rgba(14,27,45,0.18)' : ''}">
        <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:${labCol};font-weight:700">${r.label}</span>
        <span style="font-family:var(--serif);font-size:14.5px;color:var(--ink);line-height:1.5">${r.body}</span>
      </div>`;
    }).join('');
  }

  function footerHTML(constraints, savedFrom){
    return `<span style="font-family:var(--mono);font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);font-weight:700">${constraints}</span>
      <span style="font-family:var(--serif);font-style:italic;font-size:12px;color:var(--terra)">${savedFrom}</span>`;
  }

  const TOOLS = {
    sar: {
      type:'p', name:'SAR-grade <em>narrative frame.</em>', cat:'SAR · narrative frame',
      ver:5, edited:'4 days ago', runs:23, keep:78, origin:'Mod 09',
      previewBody: () => '<div style="display:grid;gap:8px">' + rowsHTML([
        { label:'Who',   body:'Subject account, branch staff, related parties — name, role, account ref.' },
        { label:'What',  body:'Activity description in chronological order, facts only, no characterization.' },
        { label:'Where', body:'Branch, channel, counterparties; geographies and instrument types.' },
        { label:'When',  body:'Date range, cadence; tie individual transactions to the timeline.' },
        { label:'Why suspicious', body:'Specific red flags. Cite the typology. Do not speculate on intent.', accent:true },
      ], 'var(--terra)') + '</div>',
      footer: () => footerHTML('Constraints: ≤280 words · past tense · 3rd person', 'Saved from Mod 09'),
      body:`<role>
You are a BSA officer drafting the narrative section of a Suspicious
Activity Report (SAR) for FinCEN. Your reader is a federal examiner.
Your output becomes part of the official record.
</role>

<inputs>
  <alert_facts>{{ALERT_FACTS_JSON}}</alert_facts>
  <kyc_summary>{{KYC_JSON}}</kyc_summary>
  <prior_sars>{{PRIOR_SAR_REFERENCES}}</prior_sars>
  <typology>{{NAMED_TYPOLOGY}}</typology>
</inputs>

<task>
Write a SAR narrative organized as five labelled sections:
Who · What · Where · When · Why suspicious. Each section is one to
three sentences. The full narrative is at most 280 words.
</task>

<style>
- Past tense throughout. Third person only.
- Facts only. No characterization. No speculation about intent.
- Cite the named typology by FinCEN term (e.g. "structuring",
  "elder financial exploitation", "trade-based money laundering").
- Use specific quantities and dates supplied in <inputs>. Do not
  invent or round figures.
- Strip judgement adjectives ("clearly", "obviously",
  "suspiciously"). Replace with the underlying fact.
</style>

<process>
Work through these steps silently. Do not emit them.
1. Quote three to five facts from <alert_facts> that most directly
   support the named <typology>.
2. Group those facts under Who / What / Where / When and identify the
   evidentiary gap that the Why section must close.
3. Verify every date and amount you plan to use is present verbatim
   in <inputs>. If a value is not present, omit it.
Then draft the narrative.
</process>

<output_format>
Emit only the narrative, with the five section headers in order. No
preamble, no summary, no reasoning. End with a word count inside
<wc>...</wc>.
</output_format>

<example>
WHO: Account 4815-2207 ("R. Chen, sole proprietor, dba Pacific
Imports") at the Belltown branch.
WHAT: Eleven cash deposits between $9,200 and $9,950 over fourteen
business days, each below the $10,000 CTR threshold, into a single
operating account.
WHERE: All deposits made at Belltown branch ATM and teller windows.
No deposits at other branches or channels.
WHEN: March 4, 2026 through March 22, 2026, inclusive.
WHY SUSPICIOUS: Deposit pattern is consistent with the structuring
typology defined in the FinCEN BSA/AML Examination Manual. Each
deposit fell within $800 of the CTR threshold; aggregate cash
deposits exceeded the prior six-month average for this account by
340%. No business documentation supplied accounts for the increased
cash volume.
<wc>122</wc>
</example>`,
      bodyLabel:'Prompt body',
      composes:[{c:'pb',n:'BSA starter kit'},{c:'a',n:'Narrative builder'},{c:'s',n:'Tense check'},{c:'s',n:'Strip adjectives'}],
      history:[
        { v:5, msg:'Added the <em>280-word cap.</em>', when:'4d ago', model:'Opus' },
        { v:4, msg:'Reordered to put <em>"Why suspicious"</em> last.', when:'2w ago', model:'Opus' },
        { v:3, msg:'Removed <em>"in the analyst\'s view."</em>', when:'5w ago', model:'GPT-5' },
        { v:2, msg:'Added <em>"do not speculate."</em>', when:'8w ago', model:'Sonnet' },
        { v:1, msg:'Initial scaffold.', when:'from Mod 09', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/sar-frame-v5-x9k2', users:12, forks:3, avs:['a','b','c','d'] },
    },
    tone: {
      type:'s', name:'Tone — <em>dry banker.</em>', cat:'Skill · tone control',
      ver:3, edited:'6 days ago', runs:18, keep:92, origin:'Mod 07',
      previewBody: () => '<div style="display:grid;gap:8px">' + rowsHTML([
        { label:'Strip', body:'Adjectives. Hedges. Hype words. Marketing-speak.' },
        { label:'Strip', body:'Implied judgment, intent attribution, second-guessing.' },
        { label:'Enforce', body:'Past tense. Third person. Specific quantities over qualifiers.' },
        { label:'Enforce', body:'Active voice for actions taken; passive only for unknown actors.' },
        { label:'Threshold', body:'Pass only if dryness score ≥ 0.80 on the in-house grader.', accent:true },
      ], 'var(--ink-2)') + '</div>',
      footer: () => footerHTML('Applies before any send · auto-graded', 'Saved from Mod 07'),
      body:`<role>
You are a copy editor enforcing the in-house BSA voice. Your job is
to rewrite supplied text so it reads like a banker wrote it: dry,
specific, past-tense, third-person.
</role>

<text_to_rewrite>
{{TEXT}}
</text_to_rewrite>

<style_rules>
Strip:
- Adjectives that imply judgement (clearly, obviously, remarkable,
  outrageous, suspicious).
- Hedges (might, perhaps, seems, appears to, possibly).
- Hype words (unlock, leverage, supercharge, revolutionize).
- Marketing voice and second-person ("you", "we") in narrative
  passages.

Enforce:
- Past tense.
- Third person.
- Active voice for actions taken. Passive only for unknown actors.
- Specific quantities and dates over qualitative claims. If the
  source has a number, use it; do not soften.

Preserve:
- Direct quotes (text inside double quotes).
- Numeric values exactly as supplied.
- Section structure and ordering of facts.
</style_rules>

<process>
1. Read the text once.
2. List every span you intend to change, with the reason, inside
   <changes>...</changes>. One line per change.
3. Apply all the changes and emit the rewritten text inside
   <rewrite>...</rewrite>.
4. If any sentence cannot be rewritten without losing meaning, leave
   it as-is and flag it inside <flagged>...</flagged> with a short
   reason.
</process>

<acceptance>
Before returning, score the rewrite on the in-house dryness rubric
(0.0 to 1.0). Pass only if score is at least 0.80; otherwise revise
and re-score. Include the final score inside <score>...</score>.
</acceptance>

<example>
<changes>
- "remarkable spike" → "340% increase" — adjective with no anchor
- "we suspect" → removed — second-person hedge
- "is occurring" → "occurred on 3/14" — continuous tense, no date
</changes>
<rewrite>
Cash deposits to account 4815-2207 increased 340% over the
fourteen-day window ending March 22, 2026. Each deposit fell within
$800 of the $10,000 CTR threshold.
</rewrite>
<score>0.91</score>
</example>`,
      bodyLabel:'Skill body',
      composes:[{c:'p',n:'SAR-grade frame'},{c:'p',n:'Board summary'},{c:'a',n:'Narrative builder'}],
      history:[
        { v:3, msg:'Added <em>dryness threshold</em> gate.', when:'6d ago', model:'Opus' },
        { v:2, msg:'Extended hype-word list.', when:'3w ago', model:'Sonnet' },
        { v:1, msg:'Initial draft from a SAR memo I rewrote.', when:'from Mod 07', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/tone-dry-v3-m4r9', users:7, forks:1, avs:['a','b'] },
    },
    builder: {
      type:'a', name:'BSA narrative <em>builder.</em>', cat:'Agent · 3-step chain',
      ver:2, edited:'9 days ago', runs:11, keep:86, origin:'Mod 12',
      previewBody: () => `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
        <div style="background:rgba(31,138,91,0.10);border:1px solid var(--green);padding:14px 14px 12px"><div style="font-family:var(--serif);font-style:italic;font-size:22px;color:var(--green);font-weight:500;line-height:1">01</div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:var(--green);font-weight:700;margin-top:6px">Gather</div><div style="font-family:var(--serif);font-size:13.5px;color:var(--ink);margin-top:4px;line-height:1.4">Pull alerts, account history, KYC, and prior SARs.</div></div>
        <div style="background:var(--green);border:1px solid var(--green);padding:14px 14px 12px;color:#FAF7EE"><div style="font-family:var(--serif);font-style:italic;font-size:22px;color:#FAF7EE;font-weight:500;line-height:1">02</div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(244,241,231,0.7);font-weight:700;margin-top:6px">Draft</div><div style="font-family:var(--serif);font-size:13.5px;color:#FAF7EE;margin-top:4px;line-height:1.4">Apply the SAR-grade frame to compose a first pass.</div></div>
        <div style="background:rgba(31,138,91,0.10);border:1px solid var(--green);padding:14px 14px 12px"><div style="font-family:var(--serif);font-style:italic;font-size:22px;color:var(--green);font-weight:500;line-height:1">03</div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:var(--green);font-weight:700;margin-top:6px">Check</div><div style="font-family:var(--serif);font-size:13.5px;color:var(--ink);margin-top:4px;line-height:1.4">Run tense + voice check. Stop on fail.</div></div>
      </div>`,
      footer: () => footerHTML('Avg run: 14s · 3 prompts · 2 skills · stops on tense fail', 'Saved from Mod 12'),
      body:`<role>
You are an agent that drafts a SAR narrative end-to-end. You operate
across three discrete steps. Each step has its own tool. You stop
between steps to surface intermediate state for human review.
</role>

<state_schema>
{
  "alert_id": string,
  "facts": object,
  "draft": string | null,
  "checks": {
    "tense": "pass" | "fail" | null,
    "voice": "pass" | "fail" | null,
    "cap":   "pass" | "warn" | "fail" | null
  },
  "status": "gathering" | "drafting" | "checking" | "done" | "blocked"
}
</state_schema>

<steps>
<step id="01" name="Gather">
  Call tool: case_facts.fetch(alert_id)
  Normalize the response into the \`facts\` object: account, parties,
  transactions, prior SARs, KYC notes. Drop free-text commentary.
  If any required field is missing, set status to "blocked" with a
  message listing the missing fields and return.
</step>

<step id="02" name="Draft">
  Call prompt: "SAR-grade narrative frame" (current version) with
  \`facts\` as input.
  Save the response into \`draft\`. Set status to "checking".
</step>

<step id="03" name="Check">
  Call skill: "BSA tense + voice check" with \`draft\` as input.
  Populate \`checks.tense\`, \`checks.voice\`, \`checks.cap\`.

  If any check is "fail": set status to "blocked", attach the
  specific spans, return. Do NOT auto-fix.
  If any check is "warn": set status to "done" but flag the warning
  for reviewer attention.
  If all checks pass: set status to "done".
</step>
</steps>

<output_format>
After each step, emit the current state as JSON inside <state>...
</state>. After step 03, also emit the final draft (if status is
"done") inside <draft>...</draft>, or the blocker detail inside
<blocker>...</blocker>.
</output_format>

<budget>
This agent runs unattended in the BSA queue. Maximum wall-clock per
run is 30 seconds. If a tool call exceeds 10 seconds, abort that
step and set status to "blocked" with the timeout reason.
</budget>`,
      bodyLabel:'Agent definition',
      composes:[{c:'p',n:'SAR-grade frame'},{c:'s',n:'Tense + voice check'},{c:'s',n:'Strip adjectives'}],
      history:[
        { v:2, msg:'Added <em>stop-on-fail</em> at step 03.', when:'9d ago', model:'Opus' },
        { v:1, msg:'Initial 3-step composition.', when:'from Mod 12', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/builder-v2-7t8w', users:3, forks:0, avs:['c'] },
    },
    kit: {
      type:'pb', name:'BSA officer <em>starter kit.</em>', cat:'Playbook · role bundle',
      ver:1, edited:'2 weeks ago', runs:8, keep:81, origin:'Compiled bundle',
      previewBody: () => `<div style="display:flex;flex-direction:column;gap:6px">
        ${[
          { tp:'P', clr:'var(--terra)', nm:'SAR-grade <em>frame.</em>',          v:'v5' },
          { tp:'P', clr:'var(--terra)', nm:'Vendor TPRM <em>exception letter.</em>', v:'v4' },
          { tp:'S', clr:'var(--ink-2)', nm:'Tone — <em>dry banker.</em>',        v:'v3' },
          { tp:'S', clr:'var(--ink-2)', nm:'Tense + <em>voice check.</em>',      v:'v4' },
          { tp:'A', clr:'var(--green)', nm:'BSA narrative <em>builder.</em>',    v:'v2' },
        ].map(t => `<div style="display:grid;grid-template-columns:30px 1fr 60px;gap:12px;align-items:center;padding:8px 0;border-bottom:1px dashed rgba(14,27,45,0.18)">
          <span style="font-family:var(--mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:${t.clr};border:1px solid ${t.clr};padding:2px 5px;text-align:center">${t.tp}</span>
          <span style="font-family:var(--serif);font-size:14.5px;color:var(--ink)">${t.nm}</span>
          <span style="font-family:var(--mono);font-size:10px;color:var(--muted);font-weight:600;text-align:right">${t.v}</span>
        </div>`).join('')}
      </div>`,
      footer: () => footerHTML('Role: BSA officer · 5 tools · adopt as one click', 'Curated by AiBI'),
      body:`<bundle name="BSA officer starter kit" version="1">

This is a curated bundle, not a prompt. Adopting the kit copies the
five referenced tools (at the listed versions) into your personal
toolbox. The kit acts as a manifest only; updates to a member tool
do not automatically propagate to your copies.

<members>
  <tool kind="prompt" id="sar"        version="5"
        purpose="Draft the SAR narrative section." />
  <tool kind="prompt" id="tprm"       version="4"
        purpose="Issue a vendor TPRM exception letter." />
  <tool kind="skill"  id="tone"       version="3"
        purpose="Enforce the dry-banker voice on any draft." />
  <tool kind="skill"  id="tensecheck" version="4"
        purpose="Validate tense, voice, citations, and word cap." />
  <tool kind="agent"  id="builder"    version="2"
        purpose="Gather → draft → check, end-to-end." />
</members>

<install>
- Pinned to the top of your shelf.
- Inherits share visibility from your default sharing setting.
- Each member retains its own version history; forking the bundle
  forks the manifest, not the tools.
</install>

<deprecation_policy>
A bundle is marked stale when any member tool has a version published
that is at least two versions ahead of the pinned version, or when a
member tool is itself flagged stale. Adopters receive an update prompt
on next session.
</deprecation_policy>`,
      bodyLabel:'Playbook manifest',
      composes:[],
      history:[
        { v:1, msg:'Curated bundle compiled and shipped.', when:'2w ago', model:'Curator' },
      ],
      share:{ link:'toolbox.aibi.com/share/kit-bsa-v1-z2k7', users:26, forks:5, avs:['a','b','c','d'] },
    },
    pasttense: {
      type:'p', name:'Past-tense, <em>third-person rewrite.</em>', cat:'Prompt · rewrite',
      ver:8, edited:'38 days ago', runs:34, keep:75, origin:'Mod 03', stale:true,
      previewBody: () => `<div style="display:grid;gap:10px">
        <div style="background:rgba(142,59,42,0.06);border-left:3px solid var(--weak);padding:10px 14px">
          <div style="font-family:var(--mono);font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:var(--weak);font-weight:700">Before</div>
          <div style="font-family:var(--serif);font-size:14px;color:var(--ink-2);margin-top:4px;line-height:1.5">"The analyst is reviewing the account and believes additional activity is occurring."</div>
        </div>
        <div style="background:rgba(31,138,91,0.06);border-left:3px solid var(--green);padding:10px 14px">
          <div style="font-family:var(--mono);font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:var(--green);font-weight:700">After</div>
          <div style="font-family:var(--serif);font-size:14px;color:var(--ink-2);margin-top:4px;line-height:1.5">"The analyst reviewed the account and identified additional activity on ${'${date}'}."</div>
        </div>
      </div>`,
      footer: () => footerHTML('Stale 38 days · model drift suspected · review before run', 'Saved from Mod 03'),
      body:`<role>
You are a rewriter that converts narrative prose into past-tense,
third-person form suitable for a regulatory record.
</role>

<input>
{{TEXT}}
</input>

<rules>
1. Convert all verbs to simple past tense. Avoid past-continuous
   ("was reviewing") unless the original event was genuinely
   ongoing and bracketed by other timed events.
2. Convert first and second person ("I", "we", "you") to the named
   third-person actor. If the actor is not named in the input,
   surface the gap rather than guess.
3. Replace belief verbs ("believes", "thinks", "suspects",
   "feels") with action verbs supported by evidence ("identified",
   "documented", "observed", "filed").
4. Replace present-continuous of events ("is occurring", "are
   happening") with discrete dated events. If no date is in the
   input, surface the gap.
5. Preserve numbers, dollar amounts, and direct quotes exactly.
</rules>

<process>
For each sentence:
  a. Tag the verb tense and the actor reference.
  b. If a rule applies, list the planned change inside <plan>.
  c. Emit the rewritten sentence inside <out>.
  d. If a rewrite would change meaning, leave the sentence and add a
     <flag> with the reason; surface this to the reviewer.
</process>

<example>
<input>
The analyst is reviewing the account and believes additional
suspicious activity is occurring.
</input>
<plan>
- "is reviewing" → "reviewed" — present continuous, has implicit
  discrete event (the review session).
- "believes" → drop belief verb, anchor to evidence.
- "additional suspicious activity is occurring" → "identified
  additional cash deposits on {{DATE}}" — needs date input;
  flag if absent.
</plan>
<out>
The analyst reviewed account 4815-2207 and identified additional
cash deposits on {{DATE}}.
</out>
<flag scope="{{DATE}}">Date was not present in the source
sentence; flagged for reviewer to supply.</flag>
</example>

<deprecation_note>
This tool has not been re-evaluated since v8 (38 days ago) and may
drift on newer models. Re-run against the in-house regression set
before bulk use.
</deprecation_note>`,
      bodyLabel:'Prompt body',
      composes:[{c:'p',n:'SAR-grade frame'},{c:'s',n:'Tense check'}],
      history:[
        { v:8, msg:'Added <em>belief-verb replacement</em> rule.', when:'38d ago', model:'Sonnet' },
        { v:7, msg:'Required dated discrete events.', when:'2mo ago', model:'GPT-5' },
        { v:6, msg:'Removed example block that drifted.', when:'3mo ago', model:'Opus' },
        { v:5, msg:'Added flag-on-meaning-change clause.', when:'3mo ago', model:'Sonnet' },
        { v:4, msg:'Tightened to active voice.', when:'4mo ago', model:'GPT-4' },
        { v:3, msg:'Removed second-person carve-out.', when:'5mo ago', model:'GPT-4' },
        { v:2, msg:'Added third-person enforcement.', when:'5mo ago', model:'GPT-4' },
        { v:1, msg:'Initial scaffold from a Mod 03 exercise.', when:'from Mod 03', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/pasttense-v8-h2k1', users:1, forks:0, avs:['a'] },
    },
    creditmemo: {
      type:'p', name:'Credit memo · <em>4-prompt scaffold.</em>', cat:'Prompt · scaffold',
      ver:3, edited:'11 days ago', runs:14, keep:84, origin:'Mod 05',
      previewBody: () => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          { n:'01', t:'Borrower',    d:'Name, entity type, history, prior accommodations.' },
          { n:'02', t:'Sources',     d:'Income streams, collateral, secondary repayment.' },
          { n:'03', t:'Risk',        d:'Concentrations, leverage, sensitivity, conditions.' },
          { n:'04', t:'Recommend',   d:'Structure, covenants, monitoring, fallback action.' },
        ].map(p => `<div style="background:var(--terra-soft);border:1px solid rgba(181,134,42,0.40);padding:12px 14px"><span style="font-family:var(--serif);font-style:italic;font-size:20px;color:var(--terra);font-weight:500;line-height:1">${p.n}</span><div style="font-family:var(--mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-2);font-weight:700;margin-top:4px">${p.t}</div><div style="font-family:var(--serif);font-size:13px;color:var(--ink-2);line-height:1.4;margin-top:4px">${p.d}</div></div>`).join('')}
      </div>`,
      footer: () => footerHTML('Human writes each section · AI compiles · reviewer rubric attached', 'Saved from Mod 05'),
      body:`<role>
You are a credit officer scaffolding a credit memo. You produce four
discrete sub-prompts, one per section, that a lender will edit before
moving to the next section. You do not compose the full memo in one
shot.
</role>

<inputs>
  <borrower_packet>{{BORROWER_PACKET}}</borrower_packet>
  <financial_statements>{{FINANCIALS}}</financial_statements>
  <collateral>{{COLLATERAL_DESC}}</collateral>
  <bank_policy>{{POLICY_REFS}}</bank_policy>
</inputs>

<scaffold>
<section id="01" title="Borrower">
  Compose a one-paragraph borrower context summary:
  - Legal name, entity type, jurisdiction, ownership.
  - Industry and primary revenue model.
  - Years in business and prior relationship with the bank.
  - Any prior accommodations and how they performed.
  Cite the page or document for each fact. Do not infer.
</section>

<section id="02" title="Sources of Repayment">
  Identify primary and secondary repayment sources. For each:
  - Source description.
  - Most recent twelve months of supporting evidence.
  - DSCR or coverage ratio if computable from the financials.
  - One sentence on durability under reasonable stress.
  Rank by reliability. Surface any gap that prevents ranking.
</section>

<section id="03" title="Risk">
  List the material risks under fixed headings:
  - Concentrations (customer, geographic, industry).
  - Leverage and liquidity.
  - Sensitivity (interest rate, FX, commodity).
  - Conditions precedent and ongoing covenants needed.
  For each risk, name the specific mitigant and who owns it.
</section>

<section id="04" title="Recommend">
  Propose:
  - Facility type, amount, tenor, pricing.
  - Covenants (financial and affirmative).
  - Monitoring cadence (which reports, which dates, who reviews).
  - Fallback action if a covenant trips: cure period, then step.
  Always include monitoring and a fallback; both are required.
</section>
</scaffold>

<style>
- Plain English. No jargon that is not defined on first use.
- Quantified claims only. "Strong cash flow" is not acceptable;
  "DSCR of 1.45x trailing twelve months" is.
- One page per section maximum.
</style>

<workflow>
Run section 01. Wait for human acceptance. Run section 02 with
section 01 as context. Continue. Do not auto-chain across sections;
human edits each output before moving on.
</workflow>`,
      bodyLabel:'Prompt scaffold',
      composes:[{c:'s',n:'Extract amounts → table'},{c:'s',n:'Tone — dry banker'},{c:'a',n:'Memo reviewer 3-pass'}],
      history:[
        { v:3, msg:'Added <em>monitoring + fallback</em> requirement.', when:'11d ago', model:'Opus' },
        { v:2, msg:'Reordered risk before recommend.', when:'1mo ago', model:'Sonnet' },
        { v:1, msg:'Initial 4-pass scaffold.', when:'from Mod 05', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/credit-v3-r4n2', users:2, forks:1, avs:['b','c'] },
    },
    extract: {
      type:'s', name:'Extract amounts &amp; <em>dates → table.</em>', cat:'Skill · structured extract',
      ver:2, edited:'5 days ago', runs:42, keep:88, origin:'Mod 08',
      previewBody: () => `<div style="border:1px solid var(--rule-2);background:#FFF">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 0.6fr;background:var(--paper-2);border-bottom:1px solid var(--rule-2)">
          <div style="padding:8px 12px;font-family:var(--mono);font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-2);font-weight:700">Amount</div>
          <div style="padding:8px 12px;font-family:var(--mono);font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-2);font-weight:700">Date</div>
          <div style="padding:8px 12px;font-family:var(--mono);font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-2);font-weight:700">Type</div>
          <div style="padding:8px 12px;font-family:var(--mono);font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-2);font-weight:700;text-align:right">Conf</div>
        </div>
        ${[['$12,400','3/14','wire','0.94'],['$7,800','3/19','ach','0.91'],['$3,200','3/21','cash','0.87'],['$2,100','3/24','check','0.72'],['$890','3/29','ach','0.69']].map(r => `<div style="display:grid;grid-template-columns:1fr 1fr 1fr 0.6fr;border-bottom:1px solid var(--rule)"><div style="padding:7px 12px;font-family:var(--mono);font-size:12px;color:var(--ink)">${r[0]}</div><div style="padding:7px 12px;font-family:var(--mono);font-size:12px;color:var(--ink-2)">${r[1]}</div><div style="padding:7px 12px;font-family:var(--mono);font-size:12px;color:var(--ink-2)">${r[2]}</div><div style="padding:7px 12px;font-family:var(--mono);font-size:12px;color:${parseFloat(r[3])<0.75 ? 'var(--weak)' : 'var(--ink-2)'};text-align:right;font-weight:${parseFloat(r[3])<0.75 ? '700' : '500'}">${r[3]}</div></div>`).join('')}
      </div>`,
      footer: () => footerHTML('Confidence < 0.75 surfaces a review prompt · no auto-write', 'Saved from Mod 08'),
      body:`<role>
You are a structured-extraction skill. You return JSON, not prose.
</role>

<input>
{{SOURCE_TEXT}}
</input>

<schema>
Return a JSON array. Each element has the shape:
{
  "amount":          number,        // numeric value, no currency
  "currency":        string,        // ISO 4217 (e.g. "USD")
  "date_iso":        string,        // YYYY-MM-DD; null if absent
  "instrument_type": string,        // wire | ach | cash | check | card | other
  "source_span":     string,        // exact substring from <input>
  "confidence":      number         // 0.00 to 1.00
}
</schema>

<rules>
1. Extract every explicit monetary amount and every explicit date.
2. Do not infer dates from context ("last Tuesday", "earlier this
   week") unless a calendar anchor is supplied; if anchored, resolve
   and lower confidence by 0.10.
3. Skip soft amounts: "approximately", "roughly", "around", ranges
   like "$10k-15k". Emit them only if the user supplies a flag to
   include soft amounts.
4. \`source_span\` must be a verbatim substring of the input. If you
   need to merge spans, set confidence ≤ 0.70 and explain in the
   \`note\` field (add the field as needed; consumers ignore unknown
   fields).
5. For every row with confidence < 0.75, mirror it into a
   \`<for_review>\` array so a human can adjudicate.
</rules>

<process>
First pass: locate dollar signs, currency words, and numeric tokens.
Second pass: locate date patterns (ISO, US, written-out).
Third pass: join nearby amount + date + instrument tokens within
the same sentence; assign confidence based on proximity, presence
of an instrument keyword, and ambiguity of the amount token.
</process>

<output_format>
Emit a single JSON object:
{
  "extracted":  [ ...rows with confidence ≥ 0.75... ],
  "for_review": [ ...rows with confidence < 0.75... ]
}
No surrounding prose. No code fences.
</output_format>

<example>
<input>
On 3/14 the customer wired $12,400 from Pacific Imports. Three days
later an ACH of approximately $8,000 hit the operating account, and
a $3,200 cash deposit was made at the Belltown branch on 3/21.
</input>
<output>
{
  "extracted": [
    {"amount":12400,"currency":"USD","date_iso":"2026-03-14","instrument_type":"wire","source_span":"wired $12,400","confidence":0.94},
    {"amount":3200,"currency":"USD","date_iso":"2026-03-21","instrument_type":"cash","source_span":"$3,200 cash deposit","confidence":0.91}
  ],
  "for_review": []
}
</output>
Note: the $8,000 ACH is skipped because "approximately" makes it a
soft amount.
</example>`,
      bodyLabel:'Skill body',
      composes:[{c:'p',n:'Credit memo scaffold'},{c:'p',n:'Quarterly trend brief'},{c:'a',n:'Memo reviewer 3-pass'}],
      history:[
        { v:2, msg:'Added <em>confidence-flag</em> for low-conf rows.', when:'5d ago', model:'Opus' },
        { v:1, msg:'Initial schema extraction.', when:'from Mod 08', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/extract-v2-n8p3', users:5, forks:2, avs:['a','b'] },
    },
    tprm: {
      type:'p', name:'Vendor TPRM — <em>exception letter.</em>', cat:'Prompt · vendor letter',
      ver:4, edited:'18 days ago', runs:9, keep:50, origin:'Mod 11', update:true,
      previewBody: () => `<div style="background:#FFF;border:1px solid var(--rule-2);padding:18px 22px">
        <div style="font-family:var(--mono);font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);font-weight:700">Re: Vendor TPRM exception · ${'${VENDOR}'}</div>
        <div style="font-family:var(--serif);font-size:14px;color:var(--ink);margin-top:14px;line-height:1.55">
          <div>Dear ${'${VENDOR_CONTACT}'},</div>
          <div style="margin-top:10px">In connection with our ongoing vendor risk review, the Bank has identified a control gap regarding ${'${CONTROL_AREA}'}. Per our agreement and the Bank's third-party risk policy, we are issuing this exception notice.</div>
          <div style="margin-top:8px">Required remediation:</div>
          <div style="margin-top:4px;padding-left:14px">
            <div>• ${'${REMEDIATION_1}'}</div>
            <div>• ${'${REMEDIATION_2}'}</div>
          </div>
          <div style="margin-top:10px">Expected completion: ${'${DEADLINE}'}.</div>
          <div style="margin-top:14px;font-style:italic">— ${'${SIGNER_NAME}'}, BSA Officer</div>
        </div>
      </div>`,
      footer: () => footerHTML('Update available · model policy changed · review before send', 'Saved from Mod 11'),
      body:`<role>
You are a BSA officer drafting a third-party risk management (TPRM)
exception letter to a vendor. The letter goes into the vendor file
and may be reviewed by an examiner.
</role>

<inputs>
  <vendor>{{VENDOR_NAME}}</vendor>
  <vendor_contact>{{VENDOR_CONTACT}}</vendor_contact>
  <agreement_ref>{{AGREEMENT_SECTION}}</agreement_ref>
  <control_area>{{CONTROL_AREA}}</control_area>
  <observed_gap>{{GAP_DESCRIPTION}}</observed_gap>
  <required_remediation>{{REMEDIATION_LIST}}</required_remediation>
  <deadline>{{DEADLINE_ISO}}</deadline>
  <signer>{{SIGNER_NAME}}</signer>
</inputs>

<task>
Compose a one-page exception letter using the format below.
</task>

<format>
Subject: Vendor TPRM exception — {{VENDOR_NAME}} — {{CONTROL_AREA}}

Dear {{VENDOR_CONTACT}},

[Paragraph 1 — context: cite the agreement section, the bank's
TPRM policy, and the date of the review that surfaced the gap. One
to two sentences.]

[Paragraph 2 — observation: state the observed gap in
{{CONTROL_AREA}}. Reference the bank's expected control. Two to
three sentences. Do not characterize intent.]

Required remediation:
- [item 1 from {{REMEDIATION_LIST}}]
- [item 2 from {{REMEDIATION_LIST}}]
- (additional items as supplied)

Expected completion: {{DEADLINE_ISO}}.

[Paragraph 3 — escalation: state the consequence of non-remediation
in neutral terms. Do not threaten litigation. Refer escalation to
the agreement's dispute-resolution section.]

[Closing — signature block.]

— {{SIGNER_NAME}}, BSA Officer
The Bank
</format>

<style>
- Formal, direct, plain English.
- No hedging ("we believe", "it seems"). State observations.
- No legal conclusions; the letter is administrative, not legal.
- No threats. Escalation language stays factual.
</style>

<gates>
Before returning, run these checks. Fail returns to the user.
1. Every {{PLACEHOLDER}} resolved.
2. Deadline is ISO date in the future.
3. Remediation list has at least one item.
4. Letter fits on one page (approx 350 words).
5. Reserve a [LEGAL REVIEW] placeholder at the end for in-house
   counsel to sign off before send.
</gates>

<update_note>
v4 published 18 days ago. The model policy on vendor letters
changed; re-run a benchmark sample before bulk send.
</update_note>`,
      bodyLabel:'Prompt body',
      composes:[{c:'s',n:'Tone — dry banker'},{c:'s',n:'Tense + voice check'}],
      history:[
        { v:4, msg:'Added <em>remediation bullet</em> structure.', when:'18d ago', model:'Opus' },
        { v:3, msg:'Removed "we believe" hedging.', when:'2mo ago', model:'Sonnet' },
        { v:2, msg:'Added deadline field.', when:'3mo ago', model:'Sonnet' },
        { v:1, msg:'Initial template.', when:'from Mod 11', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/tprm-v4-w8x2', users:2, forks:0, avs:['a'] },
    },
    tensecheck: {
      type:'s', name:'BSA tense + <em>voice check.</em>', cat:'Skill · validator',
      ver:4, edited:'7 days ago', runs:31, keep:90, origin:'Mod 04',
      previewBody: () => `<div style="display:grid;gap:6px">
        ${[
          { mk:'✓', clr:'var(--green)', label:'Past tense throughout',  detail:'No present-continuous or future verbs.' },
          { mk:'✓', clr:'var(--green)', label:'Third person enforced',  detail:'No "I", "we", or "you" in narrative.' },
          { mk:'✗', clr:'var(--weak)',  label:'No speculation language',detail:'Found 2 belief verbs — surfaced for fix.' },
          { mk:'✓', clr:'var(--green)', label:'Facts have citations',   detail:'Every quantitative claim links to a span.' },
          { mk:'~', clr:'var(--terra)', label:'≤ 280 word cap',         detail:'287 — slightly over; tighten 7 words.' },
        ].map(r => `<div style="display:grid;grid-template-columns:24px 1fr;gap:12px;align-items:baseline;padding:8px 10px;background:var(--paper-2);border:1px solid var(--rule)">
          <span style="color:${r.clr};font-family:var(--mono);font-size:14px;font-weight:700;text-align:center">${r.mk}</span>
          <div><div style="font-family:var(--serif);font-size:14px;color:var(--ink);font-weight:500">${r.label}</div><div style="font-family:var(--mono);font-size:10.5px;color:var(--muted);margin-top:2px">${r.detail}</div></div>
        </div>`).join('')}
      </div>`,
      footer: () => footerHTML('Blocks send on any ✗ · surfaces ~ for human review', 'Saved from Mod 04'),
      body:`<role>
You are a validator. You read a finished draft and return a
structured verdict, not a rewrite.
</role>

<input>
{{DRAFT_TEXT}}
</input>

<checks>
<check id="tense" weight="block">
  Every verb is past tense. Past-continuous is allowed only for
  bracketed ongoing events.
</check>
<check id="voice" weight="block">
  Third person throughout the narrative. First or second person is
  allowed only inside direct quotes.
</check>
<check id="no_speculation" weight="block">
  No belief verbs (believes, thinks, suspects, feels, assumes).
  Inferences must be anchored to a documented observation.
</check>
<check id="citations" weight="block">
  Every quantitative claim (number, percentage, date) links to a
  source span. Orphan numbers fail.
</check>
<check id="word_cap" weight="warn">
  ≤ 280 words for SAR narratives, ≤ 350 words for vendor letters,
  ≤ 250 words for board summaries. Surface the actual count.
</check>
</checks>

<output_format>
Return a JSON object:
{
  "verdict": "pass" | "warn" | "fail",
  "checks": [
    {
      "id":      "tense" | "voice" | "no_speculation" | "citations" | "word_cap",
      "status":  "pass" | "warn" | "fail",
      "spans":   [ { "text": string, "reason": string } ],
      "fix_hint": string
    }
  ],
  "word_count": number
}
The overall \`verdict\` is "fail" if any block check failed; "warn"
if only warn checks tripped; "pass" otherwise.
</output_format>

<rules>
- Do not rewrite the draft. Return spans for the editor to fix.
- Do not auto-fix even on warn. Surface and stop.
- Be specific: every flagged span quotes the exact substring.
</rules>

<example>
<input>
The analyst believes additional activity is occurring on the
account. There was a 340% spike clearly tied to structuring.
</input>
<output>
{
  "verdict": "fail",
  "checks": [
    {"id":"tense","status":"fail",
     "spans":[{"text":"is occurring","reason":"present continuous"}],
     "fix_hint":"Replace with a dated past-tense event."},
    {"id":"no_speculation","status":"fail",
     "spans":[{"text":"believes","reason":"belief verb"},
              {"text":"clearly tied to","reason":"unanchored adverb"}],
     "fix_hint":"Anchor to a documented red-flag observation."},
    {"id":"voice","status":"pass","spans":[],"fix_hint":""},
    {"id":"citations","status":"warn",
     "spans":[{"text":"340% spike","reason":"no source span"}],
     "fix_hint":"Cite the period and baseline."},
    {"id":"word_cap","status":"pass","spans":[],"fix_hint":""}
  ],
  "word_count": 28
}
</output>
</example>`,
      bodyLabel:'Skill body',
      composes:[{c:'p',n:'SAR-grade frame'},{c:'p',n:'Past-tense rewrite'},{c:'a',n:'BSA narrative builder'}],
      history:[
        { v:4, msg:'Added <em>belief-verb detector.</em>', when:'7d ago', model:'Opus' },
        { v:3, msg:'Word cap enforced as warn, not block.', when:'3w ago', model:'Sonnet' },
        { v:2, msg:'Added citation requirement.', when:'2mo ago', model:'Sonnet' },
        { v:1, msg:'Initial 3-check version.', when:'from Mod 04', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/tensecheck-v4-k9j3', users:6, forks:1, avs:['b','c'] },
    },
    trend: {
      type:'p', name:'Quarterly <em>trend brief.</em>', cat:'Prompt · brief',
      ver:1, edited:'today', runs:1, keep:null, origin:'Mod 06', isNew:true,
      previewBody: () => `<div style="background:#FFF;border:1px solid var(--rule-2);padding:18px 22px">
        <div style="display:flex;align-items:baseline;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid rgba(14,27,45,0.18)"><div style="font-family:var(--mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--muted);font-weight:700">Q3 trend brief</div><div style="font-family:var(--serif);font-size:18px;font-weight:500;color:var(--ink);letter-spacing:-0.015em">BSA program highlights.</div></div>
        <div style="margin-top:14px;display:flex;align-items:end;gap:6px;height:80px;border-bottom:1px solid rgba(14,27,45,0.18);padding-bottom:8px">
          ${[30,48,38,62,55,78,88,72].map((h,i) => `<div style="flex:1;height:${h}%;background:var(--terra);opacity:${0.4 + (h/100)*0.6}"></div>`).join('')}
        </div>
        <div style="margin-top:12px;display:grid;gap:6px;font-family:var(--serif);font-size:13.5px;color:var(--ink-2);line-height:1.5">
          <div><strong style="color:var(--ink)">Trends:</strong> alert volume +18% q/q; structuring up; wires flat.</div>
          <div><strong style="color:var(--ink)">Drivers:</strong> seasonal CIP spike, new digital channel exposure.</div>
          <div><strong style="color:var(--ink)">Asks:</strong> staffing for digital channel review.</div>
        </div>
      </div>`,
      footer: () => footerHTML('Cite sources for every quantitative claim · no extrapolation', 'Saved from Mod 06'),
      body:`<role>
You are a BSA analyst composing a one-page quarterly trend brief for
the Compliance Committee. The audience is non-analyst executives.
</role>

<inputs>
  <alerts_this_quarter>{{ALERTS_Q}}</alerts_this_quarter>
  <alerts_last_quarter>{{ALERTS_Q_MINUS_1}}</alerts_last_quarter>
  <sar_filings>{{SAR_FILINGS_Q}}</sar_filings>
  <staffing>{{STAFFING_HEADCOUNT}}</staffing>
  <regulatory_updates>{{REG_UPDATES_Q}}</regulatory_updates>
</inputs>

<task>
Produce a brief with exactly three sections — Trends, Drivers, Asks
— in that order. The full brief fits on one page (≤ 400 words).
</task>

<rules>
1. Every percentage cites the source span. Pattern: "+18% q/q
   [source: alerts_this_quarter / alerts_last_quarter]".
2. Quarter-over-quarter comparisons only. Year-over-year only if
   the inputs explicitly supply prior-year data.
3. No extrapolation, no forecast. Past quarter only.
4. Each Driver paragraph must name a specific cause anchored in
   <inputs>; "general increase" is not acceptable.
5. Each Ask must be a single concrete decision the committee can
   approve or reject. No buffets.
</rules>

<output_format>
TRENDS
[One to three short paragraphs, each leading with a number.]

DRIVERS
[One paragraph per driver. Name the driver, the evidence span, and
the magnitude.]

ASKS
1. [Single sentence ask, one concrete decision.]
2. [Second ask if required; otherwise omit.]

Sources cited inline as [source: <input_field>]. End with a
<wc>...</wc> word count.
</output_format>

<example>
TRENDS
Alert volume rose +18% q/q to 1,142 [source: alerts_this_quarter /
alerts_last_quarter]. Structuring-typology alerts rose +31%; wire
alerts were flat (-1%).

DRIVERS
The structuring increase concentrated in the Belltown and Eastlake
branches (61% of new alerts) [source: alerts_this_quarter]. The
Q3 digital-channel rollout exposed three new merchant categories
not previously seen in our case mix [source: regulatory_updates].

ASKS
1. Approve +1 BSA analyst FTE dedicated to digital-channel review,
   effective the start of Q4.
<wc>96</wc>
</example>`,
      bodyLabel:'Prompt body',
      composes:[{c:'s',n:'Extract amounts → table'},{c:'p',n:'Board summary'}],
      history:[
        { v:1, msg:'Just compiled — first use today.', when:'today', model:'Opus' },
      ],
      share:{ link:'toolbox.aibi.com/share/trend-v1-q3-new', users:0, forks:0, avs:[] },
    },
    reviewer: {
      type:'a', name:'Memo reviewer — <em>3-pass.</em>', cat:'Agent · review',
      ver:2, edited:'14 days ago', runs:8, keep:85, origin:'Mod 10',
      previewBody: () => `<div style="display:grid;gap:8px">
        ${[
          { roman:'i',   pass:'Facts',  status:'✓', clr:'var(--green)', detail:'All quantitative claims trace to a source span.' },
          { roman:'ii',  pass:'Tense',  status:'✓', clr:'var(--green)', detail:'Past tense + third person throughout.' },
          { roman:'iii', pass:'Hedges', status:'3', clr:'var(--terra)', detail:'3 hedge words found — surfaced for fix.' },
        ].map(p => `<div style="display:grid;grid-template-columns:32px 1fr 50px;gap:14px;align-items:center;padding:12px 14px;background:${p.clr === 'var(--green)' ? 'rgba(31,138,91,0.06)' : 'rgba(181,134,42,0.08)'};border:1px solid var(--rule)">
          <span style="font-family:var(--serif);font-style:italic;font-size:24px;color:${p.clr};font-weight:500;line-height:1">${p.roman}</span>
          <div><div style="font-family:var(--serif);font-size:15px;font-weight:500;color:var(--ink)">Pass ${p.pass}</div><div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:2px">${p.detail}</div></div>
          <span style="font-family:var(--serif);font-style:italic;font-size:22px;color:${p.clr};font-weight:500;text-align:right">${p.status}</span>
        </div>`).join('')}
      </div>`,
      footer: () => footerHTML('Human accepts each pass · stops on any unresolved fail', 'Saved from Mod 10'),
      body:`<role>
You are a memo reviewer running three sequential passes over a
draft. After each pass you surface findings and stop for the human
to accept, reject, or revise.
</role>

<input>
<draft>{{DRAFT_TEXT}}</draft>
<source_documents>{{SOURCE_DOCS}}</source_documents>
</input>

<passes>
<pass id="i" name="Facts">
  For every quantitative claim in <draft>, locate the supporting
  span in <source_documents>. Emit each claim with status:
    "anchored" — direct span match
    "computed" — derivable from spans (show the computation)
    "orphan"   — no support found
  Stop on any orphan; the human resolves before continuing.
</pass>

<pass id="ii" name="Tense and voice">
  Run the in-house "BSA tense + voice check" skill against the
  draft. Surface any failed check verbatim. Stop on any block-level
  fail.
</pass>

<pass id="iii" name="Hedges">
  Find weasel words (might, perhaps, seems, appears to, possibly,
  arguably, somewhat). For each, return the surrounding sentence
  and a suggested fix that grounds the claim or removes it.
  Warn-level finding; the human accepts or rejects per item.
</pass>
</passes>

<output_format>
After each pass, emit:
<finding pass="i" status="...">
  [Structured findings as JSON or short table.]
</finding>
Then pause and wait for human input. Do not auto-advance to the
next pass.
</output_format>

<no_auto_fix>
This agent never rewrites the draft. It surfaces specific spans and
fix hints; the author edits. Auto-fix is forbidden because it
removes the author's accountability for the final text.
</no_auto_fix>`,
      bodyLabel:'Agent definition',
      composes:[{c:'s',n:'Tense + voice check'},{c:'s',n:'Tone — dry banker'},{c:'p',n:'Board summary'}],
      history:[
        { v:2, msg:'Added <em>orphan-claim</em> detection in Pass i.', when:'14d ago', model:'Opus' },
        { v:1, msg:'Initial 3-pass chain.', when:'from Mod 10', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/reviewer-v2-m3x9', users:1, forks:0, avs:['a'] },
    },
    board: {
      type:'p', name:'Board summary — <em>one-page exec.</em>', cat:'Prompt · executive',
      ver:6, edited:'16 days ago', runs:19, keep:100, origin:'Mod 02',
      previewBody: () => `<div style="background:#FFF;border:1px solid var(--rule-2);padding:20px 24px">
        <div style="padding-bottom:8px;border-bottom:2px solid var(--ink);margin-bottom:12px">
          <div style="font-family:var(--mono);font-size:9px;letter-spacing:0.24em;text-transform:uppercase;color:var(--muted);font-weight:700">Q3 board memo</div>
          <div style="font-family:var(--serif);font-size:22px;font-weight:500;letter-spacing:-0.02em;color:var(--ink);margin-top:4px">BSA program highlights.</div>
        </div>
        ${[
          { h:'Position', t:'Alert pipeline current; SAR backlog cleared mid-quarter.' },
          { h:'Trends', t:'Volume +18% q/q. Drivers: digital channel exposure, seasonal CIP.' },
          { h:'Risks',  t:'Resource gap on digital channel review; recommend +1 FTE.' },
          { h:'Asks',   t:'Approval for FTE; clarification on Reg X memo treatment.' },
        ].map(s => `<div style="display:grid;grid-template-columns:100px 1fr;gap:14px;padding:8px 0;border-bottom:1px dashed rgba(14,27,45,0.18)"><div style="font-family:var(--mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);font-weight:700">${s.h}</div><div style="font-family:var(--serif);font-size:14px;color:var(--ink);line-height:1.5">${s.t}</div></div>`).join('')}
      </div>`,
      footer: () => footerHTML('One page only · plain English · no implementation detail', 'Saved from Mod 02'),
      body:`<role>
You are a BSA officer writing a one-page board memo for the
Compliance Committee. Your reader is the board chair. They have
fifteen minutes.
</role>

<inputs>
  <quarter_summary>{{QUARTER_SUMMARY}}</quarter_summary>
  <metrics>{{METRICS_JSON}}</metrics>
  <open_issues>{{OPEN_ISSUES}}</open_issues>
  <pending_decisions>{{PENDING_DECISIONS}}</pending_decisions>
</inputs>

<format>
Q{{QUARTER}} BOARD MEMO — BSA program

POSITION
[One sentence on overall program state. State the headline number.]

TRENDS
[One sentence per material trend. Lead with the number. ≤ 3 trends.]

RISKS
[One sentence per material risk. Name the mitigation and the owner.
≤ 3 risks.]

ASKS
1. [Single concrete decision the board can approve or reject.]
2. [Second decision if needed; otherwise omit.]

— {{SIGNER_NAME}}, BSA Officer
</format>

<rules>
- One page only. ≤ 250 words total.
- Plain English. No three-letter acronyms without expansion on
  first use.
- No implementation detail. Surface dollars, decisions, and named
  risks; the operating plan goes in the appendix the board does
  not read.
- Asks section is the most disciplined: each ask is one sentence,
  yields one decision. No bundles, no buffets.
- Every number cites its source from <inputs>.
</rules>

<gates>
1. Word count ≤ 250.
2. ASKS section has between 1 and 2 items.
3. Every section header present, in order.
4. No section exceeds 3 bullet points.
5. Reviewer prompts attached: "Does each ask map to a clean
   approve/reject? If not, split or cut."
</gates>

<example>
Q3 BOARD MEMO — BSA program

POSITION
Alert pipeline current; SAR backlog cleared on August 18.

TRENDS
Volume +18% q/q to 1,142 [source: metrics.alert_count]. Driver:
new digital-channel exposure rolled out in July.
Median SAR cycle time 11 days, down from 14 [source:
metrics.sar_cycle_median].

RISKS
Digital-channel review capacity is one analyst short of the policy
ratio; mitigation owned by the BSA officer.
Vendor TPRM exception open with Vendor X; mitigation expected by
October 30, owned by the third-party risk lead.

ASKS
1. Approve +1 BSA analyst FTE dedicated to digital-channel review,
   effective Q4.

— J. Smith, BSA Officer
</example>`,
      bodyLabel:'Prompt body',
      composes:[{c:'p',n:'Quarterly trend brief'},{c:'s',n:'Tone — dry banker'},{c:'a',n:'Memo reviewer 3-pass'}],
      history:[
        { v:6, msg:'Single-ask rule, not a buffet.', when:'16d ago', model:'Opus' },
        { v:5, msg:'Tightened to one sentence per section.', when:'1mo ago', model:'Opus' },
        { v:4, msg:'Added "no implementation detail" rule.', when:'2mo ago', model:'Sonnet' },
        { v:3, msg:'Reordered: Position first.', when:'3mo ago', model:'Sonnet' },
        { v:2, msg:'Added Trends section.', when:'4mo ago', model:'GPT-4' },
        { v:1, msg:'Initial scaffold.', when:'from Mod 02', model:'' },
      ],
      share:{ link:'toolbox.aibi.com/share/board-v6-b7r4', users:10, forks:2, avs:['b','c','d'] },
    },
  };

  // ============== OPEN DRAWER FOR A TOOL ==============
  function openDrawerFor(item){
    const t = TOOLS[item];
    if (!t) return;
    const $ = id => document.getElementById(id);

    const typeLabel = TYPE_LABELS[t.type];
    const keepStr = t.keep == null ? '—' : t.keep + '% kept';
    $('dr-header').textContent = `${typeLabel} · v${t.ver} · ${t.runs} run${t.runs===1?'':'s'} · ${keepStr}`;
    $('dr-cat').textContent = t.cat;
    $('dr-verline').textContent = `v${t.ver} · ${t.edited}`;
    $('dr-title').innerHTML = t.name;
    $('dr-body').innerHTML = t.previewBody();
    $('dr-foot').innerHTML = t.footer();
    $('dr-bodylabel').textContent = t.bodyLabel || (typeLabel + ' body');
    $('dr-prompt').textContent = t.body;

    // Composes-with chips
    $('dr-composes').innerHTML = (t.composes && t.composes.length)
      ? t.composes.map(c => `<div class="gn ${c.c}"><span class="gd"></span><span class="n">${c.n}</span></div>`).join('')
      : '<span style="font-family:var(--serif);font-style:italic;font-size:13px;color:var(--muted)">Stand-alone — not part of a chain.</span>';

    // Version timeline
    $('dr-versions').innerHTML = t.history.map((h, i) => {
      const cur = i === 0 ? ' cur' : '';
      const modLine = h.model ? ` · ${h.model}` : '';
      return `<div class="vline${cur}"><div><div class="vm">${h.msg}</div><div class="vmeta">v${h.v} · ${h.when}${modLine}</div></div></div>`;
    }).join('');

    // Share section
    $('dr-sharelink').value = t.share.link;
    $('dr-shareavs').innerHTML = t.share.avs.map(c => {
      const init = { a:'JM', b:'KR', c:'DT', d:'SP' }[c] || '··';
      return `<span class="av ${c}">${init}</span>`;
    }).join('');
    if (t.share.users === 0) {
      $('dr-sharetext').innerHTML = '<span style="color:var(--muted)">Not shared yet — be the first.</span>';
    } else {
      $('dr-sharetext').innerHTML = `<b>${t.share.users} colleague${t.share.users===1?'':'s'}</b> at your bank use this. <b>${t.share.forks} fork${t.share.forks===1?'':'s'}</b>.`;
    }

    // Wire Use in Playground for this tool
    $('dr-play').onclick = (e) => {
      e.stopPropagation();
      window.location.href = 'Playground v2.html?tool=' + item;
    };

    // Open drawer
    document.getElementById('drawer').classList.add('open');
    document.getElementById('dbg').classList.add('open');
  }

  // Wire all tile clicks to open with their own data
  document.querySelectorAll('.tile[data-item]').forEach(tile => {
    tile.addEventListener('click', (e) => {
      // Ignore clicks on inline action buttons
      if (e.target.closest('[data-stop]')) return;
      const item = tile.dataset.item;
      openDrawerFor(item);
    });
  });

  // Default open on load so the drawer template has live content
  // (does not force open the drawer — just initializes the placeholders)
  (function initDefault(){
    const t = TOOLS.sar;
    const $ = id => document.getElementById(id);
    $('dr-body').innerHTML = t.previewBody();
    $('dr-foot').innerHTML = t.footer();
    $('dr-prompt').textContent = t.body;
    $('dr-versions').innerHTML = t.history.map((h, i) => {
      const cur = i === 0 ? ' cur' : '';
      const modLine = h.model ? ` · ${h.model}` : '';
      return `<div class="vline${cur}"><div><div class="vm">${h.msg}</div><div class="vmeta">v${h.v} · ${h.when}${modLine}</div></div></div>`;
    }).join('');
    $('dr-composes').innerHTML = t.composes.map(c => `<div class="gn ${c.c}"><span class="gd"></span><span class="n">${c.n}</span></div>`).join('');
    $('dr-shareavs').innerHTML = t.share.avs.map(c => {
      const init = { a:'JM', b:'KR', c:'DT', d:'SP' }[c] || '··';
      return `<span class="av ${c}">${init}</span>`;
    }).join('');
    $('dr-sharetext').innerHTML = `<b>${t.share.users} colleagues</b> at your bank use this. <b>${t.share.forks} forks</b>.`;
  })();
