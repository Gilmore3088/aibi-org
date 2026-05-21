/* eslint-disable @typescript-eslint/no-unused-vars */
// my-toolbox/_script.js — bundled at build into a <script dangerouslySetInnerHTML>.
// This is mockup-grade JS for the toolbox surface; not part of the React tree.
// Unused-var lint is disabled because several placeholder bindings (hiddenCount,
// moreCounter, event-handler args _e/i) are kept to mirror the source mockup
// structure during the in-flight v5 redesign. Remove this disable when the
// /my-toolbox redesign lands and dead bindings are cleaned up.
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
  const TOOLS_VIEWS = {
    sar: {
      previewBody: () => '<div style="display:grid;gap:8px">' + rowsHTML([
        { label:'Who',   body:'Subject account, branch staff, related parties — name, role, account ref.' },
        { label:'What',  body:'Activity description in chronological order, facts only, no characterization.' },
        { label:'Where', body:'Branch, channel, counterparties; geographies and instrument types.' },
        { label:'When',  body:'Date range, cadence; tie individual transactions to the timeline.' },
        { label:'Why suspicious', body:'Specific red flags. Cite the typology. Do not speculate on intent.', accent:true },
      ], 'var(--terra)') + '</div>',
      footer: () => footerHTML('Constraints: ≤280 words · past tense · 3rd person', 'Saved from Mod 09'),
    },
    tone: {
      previewBody: () => '<div style="display:grid;gap:8px">' + rowsHTML([
        { label:'Strip', body:'Adjectives. Hedges. Hype words. Marketing-speak.' },
        { label:'Strip', body:'Implied judgment, intent attribution, second-guessing.' },
        { label:'Enforce', body:'Past tense. Third person. Specific quantities over qualifiers.' },
        { label:'Enforce', body:'Active voice for actions taken; passive only for unknown actors.' },
        { label:'Threshold', body:'Pass only if dryness score ≥ 0.80 on the in-house grader.', accent:true },
      ], 'var(--ink-2)') + '</div>',
      footer: () => footerHTML('Applies before any send · auto-graded', 'Saved from Mod 07'),
    },
    builder: {
      previewBody: () => `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
        <div style="background:rgba(31,138,91,0.10);border:1px solid var(--green);padding:14px 14px 12px"><div style="font-family:var(--serif);font-style:italic;font-size:22px;color:var(--green);font-weight:500;line-height:1">01</div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:var(--green);font-weight:700;margin-top:6px">Gather</div><div style="font-family:var(--serif);font-size:13.5px;color:var(--ink);margin-top:4px;line-height:1.4">Pull alerts, account history, KYC, and prior SARs.</div></div>
        <div style="background:var(--green);border:1px solid var(--green);padding:14px 14px 12px;color:#FAF7EE"><div style="font-family:var(--serif);font-style:italic;font-size:22px;color:#FAF7EE;font-weight:500;line-height:1">02</div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(244,241,231,0.7);font-weight:700;margin-top:6px">Draft</div><div style="font-family:var(--serif);font-size:13.5px;color:#FAF7EE;margin-top:4px;line-height:1.4">Apply the SAR-grade frame to compose a first pass.</div></div>
        <div style="background:rgba(31,138,91,0.10);border:1px solid var(--green);padding:14px 14px 12px"><div style="font-family:var(--serif);font-style:italic;font-size:22px;color:var(--green);font-weight:500;line-height:1">03</div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:var(--green);font-weight:700;margin-top:6px">Check</div><div style="font-family:var(--serif);font-size:13.5px;color:var(--ink);margin-top:4px;line-height:1.4">Run tense + voice check. Stop on fail.</div></div>
      </div>`,
      footer: () => footerHTML('Avg run: 14s · 3 prompts · 2 skills · stops on tense fail', 'Saved from Mod 12'),
    },
    kit: {
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
    },
    pasttense: {
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
    },
    creditmemo: {
      previewBody: () => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          { n:'01', t:'Borrower',    d:'Name, entity type, history, prior accommodations.' },
          { n:'02', t:'Sources',     d:'Income streams, collateral, secondary repayment.' },
          { n:'03', t:'Risk',        d:'Concentrations, leverage, sensitivity, conditions.' },
          { n:'04', t:'Recommend',   d:'Structure, covenants, monitoring, fallback action.' },
        ].map(p => `<div style="background:var(--terra-soft);border:1px solid var(--ledger-accent-a40);padding:12px 14px"><span style="font-family:var(--serif);font-style:italic;font-size:20px;color:var(--terra);font-weight:500;line-height:1">${p.n}</span><div style="font-family:var(--mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-2);font-weight:700;margin-top:4px">${p.t}</div><div style="font-family:var(--serif);font-size:13px;color:var(--ink-2);line-height:1.4;margin-top:4px">${p.d}</div></div>`).join('')}
      </div>`,
      footer: () => footerHTML('Human writes each section · AI compiles · reviewer rubric attached', 'Saved from Mod 05'),
    },
    extract: {
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
    },
    tprm: {
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
    },
    tensecheck: {
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
    },
    trend: {
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
    },
    reviewer: {
      previewBody: () => `<div style="display:grid;gap:8px">
        ${[
          { roman:'i',   pass:'Facts',  status:'✓', clr:'var(--green)', detail:'All quantitative claims trace to a source span.' },
          { roman:'ii',  pass:'Tense',  status:'✓', clr:'var(--green)', detail:'Past tense + third person throughout.' },
          { roman:'iii', pass:'Hedges', status:'3', clr:'var(--terra)', detail:'3 hedge words found — surfaced for fix.' },
        ].map(p => `<div style="display:grid;grid-template-columns:32px 1fr 50px;gap:14px;align-items:center;padding:12px 14px;background:${p.clr === 'var(--green)' ? 'rgba(31,138,91,0.06)' : 'var(--ledger-accent-a08)'};border:1px solid var(--rule)">
          <span style="font-family:var(--serif);font-style:italic;font-size:24px;color:${p.clr};font-weight:500;line-height:1">${p.roman}</span>
          <div><div style="font-family:var(--serif);font-size:15px;font-weight:500;color:var(--ink)">Pass ${p.pass}</div><div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:2px">${p.detail}</div></div>
          <span style="font-family:var(--serif);font-style:italic;font-size:22px;color:${p.clr};font-weight:500;text-align:right">${p.status}</span>
        </div>`).join('')}
      </div>`,
      footer: () => footerHTML('Human accepts each pass · stops on any unresolved fail', 'Saved from Mod 10'),
    },
    board: {
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
    },
  };

  // Hydrate the full TOOLS map from the JSON injection in page.tsx +
  // the view-only helpers above.
  let TOOLS_DATA = {};
  try {
    const el = document.getElementById('toolbox-tools-data');
    TOOLS_DATA = el ? JSON.parse(el.textContent || '{}') : {};
  } catch (e) { TOOLS_DATA = {}; }
  const TOOLS = Object.fromEntries(
    Object.entries(TOOLS_DATA).map(([k, d]) => [k, Object.assign({}, d, TOOLS_VIEWS[k] || {})])
  );

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

  // ============== REAL WIRING — persistence, exports, actions ==============
  // /my-toolbox is a design preview without a backend, so "persistence"
  // means localStorage. The state survives reloads but is per-browser.
  // Real toolbox persistence lives at /dashboard/toolbox (Supabase-backed).

  const LS_PIN   = 'aibi.my-toolbox.pinned';
  const LS_ROLE  = 'aibi.my-toolbox.role';
  const LS_KIT   = 'aibi.my-toolbox.activeKit';
  const LS_ADDED = 'aibi.my-toolbox.added';

  const safeRead = (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  };
  const safeWrite = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  };

  // ---------- Pin persistence ----------
  const pinnedSet = new Set(safeRead(LS_PIN, []));
  function syncPinStars(){
    document.querySelectorAll('.tile[data-item]').forEach(tile => {
      const key = tile.dataset.item;
      let star = tile.querySelector('.pin-mark');
      const want = pinnedSet.has(key) || tile.classList.contains('pinned');
      if (want && !star){
        star = document.createElement('span');
        star.className = 'pin-mark';
        star.textContent = '★';
        tile.appendChild(star);
      } else if (!want && star){
        star.remove();
      }
      tile.classList.toggle('pinned', want);
    });
  }
  syncPinStars();

  // ---------- Role + kit persistence ----------
  const savedRole = safeRead(LS_ROLE, null);
  const savedKit  = safeRead(LS_KIT,  null);
  if (savedRole){
    const roleBtn = document.querySelector('.role');
    if (roleBtn) roleBtn.innerHTML = '<span class="dot"></span>' + savedRole + ' ▾';
  }
  if (savedKit){
    document.querySelectorAll('.kit').forEach(k => k.classList.remove('active'));
    document.querySelectorAll('.kit .active-pill').forEach(p => p.remove());
    document.querySelectorAll('.kit .cta').forEach(c => { c.textContent = 'Adopt kit →'; c.style.color = ''; });
    const target = savedKit === 'bsa'
      ? document.querySelector('.kit')
      : document.querySelector('.kit[data-kit="' + savedKit + '"]');
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
  }
  const roleBtnRef = document.querySelector('.role');
  if (roleBtnRef){
    const KIT_MAP = { 'BSA officer':'bsa', 'Lender':'lender', 'Branch manager':'bm', 'Compliance':'compl' };
    new MutationObserver(() => {
      const txt = roleBtnRef.textContent.replace('▾','').trim();
      if (txt){
        safeWrite(LS_ROLE, txt);
        if (KIT_MAP[txt]) safeWrite(LS_KIT, KIT_MAP[txt]);
      }
    }).observe(roleBtnRef, { childList:true, subtree:true, characterData:true });
  }

  // ---------- Shared-with-you tile adoption ----------
  const addedList = safeRead(LS_ADDED, []);
  const gridEl = document.querySelector('.grid');
  function plainName(html){ return html.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }
  function renderAddedTile(rec){
    if (!gridEl) return;
    const article = document.createElement('article');
    article.className = 'tile t-' + (rec.type === 'agent' ? 'a' : rec.type === 'skill' ? 's' : rec.type === 'playbook' ? 'pb' : 'p');
    article.dataset.item = rec.key;
    article.innerHTML =
      '<div class="doc">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
          '<span class="d-cap" style="color:var(--terra)">From ' + rec.byline + '</span>' +
          '<span class="flag new">added</span>' +
        '</div>' +
        '<div class="d-h" style="margin-top:8px">' + rec.title + '</div>' +
        '<div style="margin-top:auto;font-family:var(--mono);font-size:7.5px;letter-spacing:0.16em;color:var(--muted);font-weight:700;text-transform:uppercase">Read-only · forked into your toolbox</div>' +
      '</div>' +
      '<div class="meta">' +
        '<span class="typetag">' + (rec.type.charAt(0).toUpperCase() + rec.type.slice(1)) + '</span>' +
        '<h3>' + rec.title + '</h3>' +
        '<div class="footer">' +
          '<div class="runs"><span class="b"></span><span class="b"></span><span class="b"></span><span class="b"></span><span class="b"></span><span class="b"></span></div>' +
          '<div class="keep"><span style="font-family:var(--mono);font-size:10px;color:var(--muted)">just added</span></div>' +
        '</div>' +
      '</div>';
    gridEl.insertBefore(article, gridEl.firstChild);
  }
  addedList.forEach(renderAddedTile);
  const adoptedTitles = new Set(addedList.map(r => r.title));
  document.querySelectorAll('.swyt').forEach(t => {
    const title = t.querySelector('h4')?.textContent?.trim() || '';
    if (adoptedTitles.has(title)){
      t.style.opacity = '0.4';
      t.style.pointerEvents = 'none';
      const accept = t.querySelector('.accept');
      if (accept){ accept.textContent = '✓ in your toolbox'; }
    }
    t.addEventListener('click', () => {
      const ttl = t.querySelector('h4')?.textContent?.trim() || '';
      const bylineName = t.querySelector('.row1 b')?.textContent?.trim() || 'colleague';
      const bylineRole = (t.querySelector('.row1')?.textContent?.split('·')[1] || '').trim() || '';
      const byline = bylineName + (bylineRole ? ' · ' + bylineRole : '');
      const typeText = t.querySelector('.row3 span')?.textContent || '';
      const type = /agent/i.test(typeText) ? 'agent' : /skill/i.test(typeText) ? 'skill' : /playbook/i.test(typeText) ? 'playbook' : 'prompt';
      if (adoptedTitles.has(ttl)) return;
      const key = 'added-' + Date.now();
      const rec = { key, title:ttl, type, byline };
      addedList.push(rec);
      safeWrite(LS_ADDED, addedList);
      adoptedTitles.add(ttl);
      renderAddedTile(rec);
      t.style.opacity = '0.4';
      t.style.pointerEvents = 'none';
      const accept = t.querySelector('.accept');
      if (accept){ accept.textContent = '✓ in your toolbox'; }
      showToast('Added to your toolbox');
    }, true);
  });

  // ---------- Real exports ----------
  function downloadBlob(filename, mime, contents){
    const blob = new Blob([contents], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }
  function currentTool(){
    const cap = document.getElementById('dr-cat')?.textContent || '';
    for (const [key, t] of Object.entries(TOOLS)){
      if (t.cat === cap) return [key, t];
    }
    return null;
  }
  function slug(s){
    return s.toLowerCase().replace(/<[^>]+>/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
  }
  function exportMarkdown(key, t){
    const md = [
      '# ' + plainName(t.name),
      '',
      '> ' + t.cat + ' · v' + t.ver + ' · edited ' + t.edited,
      '',
      '## ' + (t.bodyLabel || 'Body'),
      '',
      '```',
      t.body,
      '```',
      '',
      '## Composes with',
      '',
      (t.composes && t.composes.length)
        ? t.composes.map(c => '- ' + ({p:'prompt',s:'skill',a:'agent',pb:'playbook'}[c.c] || c.c) + ' · ' + c.n).join('\n')
        : '_Stand-alone — not part of a chain._',
      '',
      '## Version history',
      '',
      t.history.map(h => '- v' + h.v + ' · ' + h.when + (h.model ? ' · ' + h.model : '') + ' — ' + plainName(h.msg)).join('\n'),
      '',
      '---',
      '_Exported from The AI Banking Institute · My Toolbox._',
    ].join('\n');
    downloadBlob(slug(plainName(t.name)) + '.md', 'text/markdown', md);
  }
  function exportJSON(key, t){
    const obj = {
      key,
      type:   { p:'prompt', s:'skill', a:'agent', pb:'playbook' }[t.type],
      name:   plainName(t.name),
      category: t.cat,
      version: t.ver,
      edited: t.edited,
      runs:   t.runs,
      keep_rate: t.keep,
      origin: t.origin,
      body:   t.body,
      composes: t.composes,
      history: t.history,
      share:  t.share,
      exported_at: new Date().toISOString(),
      exported_from: 'The AI Banking Institute · My Toolbox',
    };
    downloadBlob(slug(plainName(t.name)) + '.json', 'application/json', JSON.stringify(obj, null, 2));
  }
  function exportPrompt(key, t){
    const text = '# ' + plainName(t.name) + '\n# ' + t.cat + ' · v' + t.ver + '\n\n' + t.body + '\n';
    downloadBlob(slug(plainName(t.name)) + '.prompt', 'text/plain', text);
  }
  function exportPDF(key, t){
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + plainName(t.name) + '</title>' +
      '<style>body{font-family:Georgia,serif;max-width:680px;margin:48px auto;padding:0 24px;color:#0E1B2D;line-height:1.55}' +
      'h1{font-weight:500;letter-spacing:-0.02em} pre{background:#F4F1E7;padding:16px 20px;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.6;border-left:3px solid #7C5814}' +
      '.meta{font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#5C6B82}</style>' +
      '</head><body>' +
      '<div class="meta">' + t.cat + ' · v' + t.ver + ' · ' + t.edited + '</div>' +
      '<h1>' + plainName(t.name) + '</h1>' +
      '<h2>' + (t.bodyLabel || 'Body') + '</h2>' +
      '<pre>' + t.body.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</pre>' +
      '<hr><p style="font-size:10px;color:#5C6B82">Exported from The AI Banking Institute · My Toolbox.</p>' +
      '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script>' +
      '</body></html>';
    const w = window.open('', '_blank');
    if (w){ w.document.write(html); w.document.close(); }
    else  { showToast('Allow pop-ups to export PDF'); }
  }
  document.querySelectorAll('.exp-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const result = currentTool();
      if (!result){ showToast('Open a tool first'); return; }
      const [key, t] = result;
      const fmt = (b.querySelector('b')?.textContent || '').toLowerCase();
      if (fmt === 'markdown') exportMarkdown(key, t);
      else if (fmt === 'json') exportJSON(key, t);
      else if (fmt === '.prompt') exportPrompt(key, t);
      else if (fmt === 'pdf') exportPDF(key, t);
      else showToast('Unknown format');
    }, true);
  });

  // ---------- Action overlay buttons on tiles ----------
  document.querySelectorAll('.tile .act').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tile = btn.closest('.tile');
      const itemKey = tile?.dataset?.item;
      const t = itemKey ? TOOLS[itemKey] : null;
      if (!t) return;
      const action = (btn.getAttribute('title') || '').toLowerCase();
      if (action.includes('run')){
        window.location.href = '/playground?tool=' + encodeURIComponent(itemKey);
      } else if (action.includes('share')){
        const link = t.share && t.share.link ? t.share.link : window.location.origin + '/my-toolbox#' + itemKey;
        try { navigator.clipboard.writeText(link); } catch(_) {}
        showToast('Share link copied');
      } else if (action.includes('fork')){
        const addedRec = { key:'fork-'+itemKey+'-'+Date.now(), title:plainName(t.name), type:({p:'prompt',s:'skill',a:'agent',pb:'playbook'}[t.type]), byline:'You · fork of ' + plainName(t.name) };
        addedList.push(addedRec);
        safeWrite(LS_ADDED, addedList);
        renderAddedTile(addedRec);
        showToast('Forked to your toolbox');
      } else if (action.includes('download')){
        exportMarkdown(itemKey, t);
      }
    }, true);
  });

  // ---------- Drawer star toggle ----------
  (function addDrawerStar(){
    const dh = document.querySelector('.drawer .dh');
    if (!dh || dh.querySelector('.dpin')) return;
    const btn = document.createElement('button');
    btn.className = 'dpin';
    btn.type = 'button';
    btn.style.cssText = 'background:transparent;border:none;font-size:18px;color:var(--terra);cursor:pointer;line-height:1;margin-right:8px';
    btn.title = 'Pin to shelf';
    btn.textContent = '☆';
    const closeBtn = dh.querySelector('.dc');
    dh.insertBefore(btn, closeBtn);
    function refresh(){
      const result = currentTool();
      const key = result ? result[0] : null;
      btn.textContent = (key && pinnedSet.has(key)) ? '★' : '☆';
    }
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const result = currentTool();
      if (!result) return;
      const [key] = result;
      if (pinnedSet.has(key)){
        pinnedSet.delete(key);
        showToast('Unpinned');
      } else {
        pinnedSet.add(key);
        showToast('Pinned to shelf');
      }
      safeWrite(LS_PIN, [...pinnedSet]);
      syncPinStars();
      refresh();
    });
    new MutationObserver(refresh).observe(document.getElementById('drawer'), { attributes:true, attributeFilter:['class'] });
    refresh();
  })();

  // ---------- Stats live-update ----------
  function recomputeStats(){
    const total = document.querySelectorAll('.shelf .tile, .grid .tile').length;
    const v = document.querySelector('.stats .stat:first-child .v');
    if (v) v.textContent = String(total);
  }
  recomputeStats();
  if (gridEl){
    new MutationObserver(recomputeStats).observe(gridEl, { childList:true });
  }
