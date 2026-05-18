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
      body:'You are a BSA officer drafting a Suspicious Activity Report narrative.\nUse only the facts provided. Do not speculate on intent.\nWrite in past tense, third person.\nStructure as: Who · What · Where · When · Why suspicious.\nStrip adjectives that imply judgment.\nCap at 280 words.',
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
      body:'Rewrite the supplied text in the BSA-officer voice:\n- Past tense, third person.\n- Strip adjectives that imply judgment.\n- Strip hedges ("might", "perhaps", "seems").\n- Strip hype ("clearly", "obviously", "remarkable").\n- Replace qualitative claims with quantified facts where available.\nFlag any sentence you could not rewrite without losing meaning.',
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
      body:'STEP 01: Gather\n  - Pull alert data, account history, KYC, prior SAR refs.\n  - Return a normalized JSON of facts only.\nSTEP 02: Draft\n  - Call prompt: SAR-grade frame (v5)\n  - Pass JSON facts as input.\nSTEP 03: Check\n  - Call skill: Tense + voice check (v4)\n  - If FAIL: surface specific lines back to the user; do not auto-fix.\n  - If PASS: emit final draft + reviewer prompts.',
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
      body:'BUNDLE: BSA officer starter kit\nROLE: bsa-officer\nTOOLS:\n  - prompt: SAR-grade frame (v5)\n  - prompt: Vendor TPRM exception letter (v4)\n  - skill: Tone — dry banker (v3)\n  - skill: Tense + voice check (v4)\n  - agent: BSA narrative builder (v2)\nADOPTION: pinned to your shelf · share inherits visibility',
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
      body:'Rewrite the supplied text:\n- Convert all verbs to simple past tense.\n- Convert all first/second person to third person.\n- Replace belief verbs ("believes", "thinks") with action verbs ("identified", "documented").\n- Replace continuous ("is occurring") with discrete events with dates.\nFlag any sentence whose tense conversion changes meaning.',
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
      body:'SCAFFOLD: 4 sub-prompts run in order.\n01 — Borrower: Generate a borrower-context summary from supplied loan docs.\n02 — Sources: Identify and rank primary/secondary repayment sources with evidence.\n03 — Risk: Surface concentrations, leverage, sensitivity, conditions precedent.\n04 — Recommend: Suggest structure + covenants. Always include monitoring + fallback.\nNote: Human edits each output before continuing. No auto-chain.',
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
      body:'Extract every monetary amount and date from the supplied text.\nReturn a JSON array with: { amount, currency, date_iso, instrument_type, source_span, confidence }.\nSkip soft amounts ("approximately", "roughly").\nFlag any row with confidence < 0.75 for human review.\nDo not infer dates from context — only extract explicit dates.',
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
      body:'Draft a vendor exception letter using the supplied facts.\nFields required: {VENDOR}, {VENDOR_CONTACT}, {CONTROL_AREA}, {REMEDIATION_1}, {REMEDIATION_2}, {DEADLINE}, {SIGNER_NAME}.\nStyle:\n- Formal but direct.\n- Reference the agreement section number if supplied.\n- No threats. No legal conclusions.\nAlways add a placeholder for legal review.',
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
      body:'Validate the supplied text against 5 checks:\n1) Past tense throughout.\n2) Third person enforced.\n3) No speculation/belief language.\n4) Facts have citations to source spans.\n5) ≤ 280 words total.\nReturn per-check: pass/fail/warn + the specific span(s) that triggered.',
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
      body:'Compose a quarterly trend brief from the supplied alert + transaction data.\nStructure: Trends · Drivers · Asks.\nEvery percentage must cite the source span.\nNo year-over-year claims unless supplied; quarter-over-quarter only.\nKeep to one page. Reviewer prompts attached for fact-check pass.',
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
      body:'AGENT: 3-pass memo reviewer.\nPASS i — Facts: Each quantitative claim must trace to a span. Surface any orphan claim.\nPASS ii — Tense: Apply Tense + voice check. Stop on fail.\nPASS iii — Hedges: Find weasel words (might, perhaps, seems, possibly). Return list + context.\nHuman approves between passes.',
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
      body:'Compose a one-page board memo:\nSECTIONS: Position · Trends · Risks · Asks.\nEach section: 1-2 sentences max.\nNo implementation detail; surface decisions and dollars only.\nEnd with one clear ask + recommendation, not a buffet.\nReviewer prompts attached: ask vs. headline check.',
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
