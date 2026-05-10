(function(){
  // ============ STATE ============
  let mode = 'single'; // single | compare | conv
  let model = 'opus';
  let compareModels = ['opus','sonnet','gpt'];
  let controls = { format:'auto', length:'standard', tone:'plain', guards:['redact'] };
  let creative = 20;
  let conversation = []; // [{role, content}]
  let sessionRuns = [];
  let lastRun = null;
  let saveType = 'prompt';

  const modelMeta = {
    opus:   { label:'Claude Opus 4.5',   short:'Opus',   color:'#D97757', cost:0.0033 },
    sonnet: { label:'Claude Sonnet 4.5', short:'Sonnet', color:'#B5862A', cost:0.0009 },
    haiku:  { label:'Claude Haiku 4.5',  short:'Haiku',  color:'#E5C29A', cost:0.0003 },
    gpt:    { label:'GPT-5',             short:'GPT-5',  color:'#1F8A5B', cost:0.0021 },
    gemini: { label:'Gemini 2.5 Pro',    short:'Gemini', color:'#1E3A5F', cost:0.0017 },
  };

  // ============ HELPERS ============
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const escapeHtml = s => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function toast(msg, ok=false){
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('ok', ok);
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function timeAgo(ts){
    const s = Math.floor((Date.now() - ts)/1000);
    if(s < 60) return 'just now';
    if(s < 3600) return Math.floor(s/60)+'m ago';
    return Math.floor(s/3600)+'h ago';
  }

  // ============ MODE ============
  const modeHelp = {
    single: 'One prompt, one model, one output. The default for trying something out.',
    compare: 'Same prompt, multiple models side-by-side. Pick the winner; the model dot turns green.',
    conv: 'Multi-turn. The model holds the thread until you Clear. Best for iterating on a draft.',
  };
  $$('.mode-btn').forEach(b => b.addEventListener('click', () => {
    $$('.mode-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    mode = b.dataset.mode;
    $('#modeHelp').textContent = modeHelp[mode];
    $('#outModeTag').textContent = b.textContent.trim().replace(/^[●⊟⇄]\s*/, '');
    syncModePick();
    renderOutputShell();
  }));

  function syncModePick(){
    const pick = $('#modelPick');
    if(mode === 'compare'){
      pick.classList.add('multi');
      $$('#modelPick button').forEach(b => {
        b.classList.toggle('sel', compareModels.includes(b.dataset.m));
      });
    } else {
      pick.classList.remove('multi');
      $$('#modelPick button').forEach(b => b.classList.toggle('sel', b.dataset.m === model));
    }
  }

  // ============ MODEL PICK ============
  $$('#modelPick button').forEach(b => b.addEventListener('click', () => {
    if(mode === 'compare'){
      const m = b.dataset.m;
      if(compareModels.includes(m)){
        if(compareModels.length > 1) compareModels = compareModels.filter(x => x !== m);
      } else {
        if(compareModels.length < 4) compareModels.push(m);
      }
      syncModePick();
    } else {
      model = b.dataset.m;
      syncModePick();
    }
  }));

  // ============ CONTROLS ============
  $$('.seg').forEach(seg => {
    const ctrl = seg.dataset.ctrl;
    seg.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      if(ctrl === 'guards'){
        // multi
        btn.classList.toggle('sel');
        controls.guards = [...seg.querySelectorAll('button.sel')].map(b => b.dataset.v);
      } else {
        seg.querySelectorAll('button').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
        controls[ctrl] = btn.dataset.v;
      }
    }));
  });

  // creative slider
  const creativeEl = $('#creative');
  const creativeVal = $('#creativeVal');
  creativeEl.addEventListener('input', e => {
    creative = +e.target.value;
    const lab = creative < 25 ? 'Careful' : creative < 60 ? 'Balanced' : creative < 85 ? 'Exploratory' : 'Wild';
    creativeVal.textContent = lab + ' ' + (creative/100).toFixed(2);
  });

  // ============ CONTEXT CHIPS ============
  $$('.ctx-chip').forEach(c => c.addEventListener('click', () => {
    if(c.dataset.ctx === 'add') return toast('Drag a file onto the prompt to attach.');
    c.classList.toggle('on');
  }));

  // ============ SYSTEM ============
  const sysPresets = {
    bsa: 'You are a BSA officer at a community credit union. Voice: factual, past-tense, examiner-aware. Never speculate. Cite the line, the date, the dollar amount. Plain language.',
    under: 'You are a senior credit underwriter at a community bank. Voice: skeptical, specific, kind. Push back on weak assumptions. Suggest stronger framings. Cite the line you are objecting to.',
    comp: 'You are a compliance reviewer reading for Reg B / ECOA / Fair Lending exposure. Flag any language that could be read as denying credit on a prohibited basis. Suggest neutral phrasing for each flag.',
    member: 'You are writing to a credit-union member. Voice: warm, direct, plain. 8th-grade reading level. No jargon. Answer the question they asked, then tell them what to do next.',
    board: 'You are writing for a board pack. Voice: confident, brief, decision-oriented. Lead with the recommendation. One sentence per material fact. Maximum 90 words.',
    reset: 'You are an experienced banker\'s assistant for a community credit union. Voice: plain, factual, examiner-aware. No marketing language. No bullet points unless asked. Answer concisely.',
  };
  $('#sysHead').addEventListener('click', () => $('#sysPanel').classList.toggle('open'));
  $('#sysInput').addEventListener('input', e => {
    $('#sysPreview').textContent = e.target.value.slice(0,120);
  });
  $$('.sys-preset').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const t = sysPresets[b.dataset.preset];
    if(t){ $('#sysInput').value = t; $('#sysPreview').textContent = t.slice(0,120); }
  }));

  // ============ VARIABLES ============
  const varVals = {};
  function detectVars(){
    const text = $('#promptInput').value;
    const matches = [...text.matchAll(/\{\{([a-z][a-z0-9_]*)\}\}/gi)].map(m => m[1]);
    const uniq = [...new Set(matches)];
    $('#varCnt').textContent = uniq.length;
    const list = $('#varsList');
    if(uniq.length === 0){
      list.innerHTML = '<div class="vars-empty">Use <code>{{name}}</code> in your prompt and the field appears here.</div>';
      return;
    }
    list.innerHTML = uniq.map(n => `
      <div class="var-row">
        <label class="vlab">{{${n}}}</label>
        <textarea data-v="${n}" placeholder="Value…">${escapeHtml(varVals[n] || '')}</textarea>
      </div>
    `).join('');
    list.querySelectorAll('textarea').forEach(t => t.addEventListener('input', e => varVals[e.target.dataset.v] = e.target.value));
  }
  $('#promptInput').addEventListener('input', detectVars);

  function fillVars(text){
    return text.replace(/\{\{([a-z][a-z0-9_]*)\}\}/gi, (_, n) => varVals[n] || ('[[' + n + ']]'));
  }

  // ============ TOOLBOX ITEMS ============
  const toolboxItems = [
    { type:'p', name:'Past-tense rewrite', meta:'Mod 09 · v3 · Run 12×', body:'Rewrite this as past-tense narrative. No speculation. The facts speak — what an examiner can read in two minutes.' },
    { type:'p', name:'Three honest critiques', meta:'Mine · v2 · Run 8×', body:'Take this credit memo and give me three honest critiques a senior underwriter would make. Be specific. Cite the line.' },
    { type:'s', name:'Reg B fairness check', meta:'Role · v1 · Run 4×', body:'Read the attached letter as if you were an examiner. Flag any language that could be read as denying credit on a prohibited basis. Suggest neutral phrasing for each flag.' },
    { type:'p', name:'Board summary in 90 words', meta:'Mod 07 · v4 · Run 6×', body:'Summarise the attached document for the board. 90 words maximum. Lead with the recommendation. Use one sentence per material fact.' },
    { type:'a', name:'Memo reviewer · 3-pass', meta:'Mod 07 · v1 · Run 4×', body:'You are the memo reviewer. Run three passes. Pass 1: structural critique. Pass 2: language and tone. Pass 3: regulatory risk. Show the diffs between passes.' },
    { type:'s', name:'Vendor TPRM exception', meta:'Role · v2 · Run 3×', body:'Draft a TPRM exception letter for vendor {{vendor}} that did not return a SOC 2. Compensating controls: {{controls}}. Sunset date: {{sunset}}.' },
    { type:'p', name:'Quarterly trend brief', meta:'Mine · v1 · Run 1×', body:'From the attached weekly briefs, identify the three most recurring themes. One sentence each. Plain language.' },
  ];

  // ============ LOAD MODAL ============
  function renderLd(filter=''){
    const f = filter.trim().toLowerCase();
    $('#ldList').innerHTML = toolboxItems
      .filter(it => !f || it.name.toLowerCase().includes(f) || it.body.toLowerCase().includes(f))
      .map(it => `<div class="ld-item" data-body="${encodeURIComponent(it.body)}" data-name="${encodeURIComponent(it.name)}" style="display:grid; grid-template-columns:auto 1fr auto; gap:12px; padding:14px 0; border-bottom:1px solid var(--rule); cursor:pointer; align-items:start">
        <span style="font-family:var(--mono); font-size:8.5px; letter-spacing:0.16em; text-transform:uppercase; padding:3px 6px; color:var(--paper); font-weight:700; align-self:start; margin-top:2px; background:${it.type==='p'?'var(--terra)':it.type==='s'?'var(--ink)':'var(--green)'}">${it.type==='p'?'Prompt':it.type==='s'?'Skill':'Agent'}</span>
        <div>
          <div style="font-family:var(--serif); font-size:15px; line-height:1.3; color:var(--ink); font-weight:500">${it.name}</div>
          <div style="font-family:var(--mono); font-size:9px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); font-weight:600; margin-top:3px">${it.meta}</div>
        </div>
        <span style="font-family:var(--mono); font-size:11px; color:var(--muted)">→</span>
      </div>`).join('');
    $('#ldList').querySelectorAll('.ld-item').forEach(el => el.addEventListener('click', () => {
      $('#promptInput').value = decodeURIComponent(el.dataset.body);
      $('#runTitle').value = decodeURIComponent(el.dataset.name);
      detectVars();
      closeLoad();
      $('#promptInput').focus();
    }));
  }
  function openLoad(){ $('#loadModal').classList.add('open'); $('#loadBg').classList.add('open'); renderLd(); }
  function closeLoad(){ $('#loadModal').classList.remove('open'); $('#loadBg').classList.remove('open'); }
  $('#loadBtn').addEventListener('click', openLoad);
  $('#loadClose').addEventListener('click', closeLoad);
  $('#loadBg').addEventListener('click', closeLoad);
  $('#ldSearch').addEventListener('input', e => renderLd(e.target.value));

  // ============ RECIPES ============
  const recipes = [
    { tag:'Compare', title:'Which model writes the cleanest <em>SAR narrative?</em>', desc:'Same transaction log into Opus, Sonnet, GPT-5. Pick the one an examiner could read.', mode:'compare', prompt:'Write a SAR narrative for the attached transaction log. Past-tense, factual, examiner-readable. Maximum 200 words. No speculation.', sys:'bsa', ctx:['tx'] },
    { tag:'Compare', title:'Which voice <em>members trust</em> more?', desc:'Same denial letter against two tones — plain vs warm. Read both out loud.', mode:'compare', prompt:'Rewrite the attached letter for the member. Two versions: one plain and direct, one warm and explanatory. Same factual content.', sys:'member' },
    { tag:'Single', title:'Stress-test a <em>credit memo.</em>', desc:'Three critiques an examiner would make. Cite the line.', mode:'single', prompt:'Take the attached credit memo and write three honest critiques a senior underwriter would make. Be specific. Cite the line.', sys:'under', ctx:['memo'] },
    { tag:'Conversation', title:'Iterate a <em>committee summary.</em>', desc:'Multi-turn. Start with a draft, ask for tightening, then for the dissent.', mode:'conv', prompt:'Draft a 90-word committee summary of the attached memo. Lead with the recommendation. After I see it, I\'ll ask you to tighten and then to write the dissent.', sys:'board', ctx:['memo'] },
    { tag:'Single', title:'Explain a <em>regulatory term</em> three ways.', desc:'For an examiner, for a member, for a board member.', mode:'single', prompt:'Explain {{term}} three ways: one paragraph each, for an examiner, for a member, and for a board member. Same facts, three voices.', sys:'reset' },
  ];
  function renderRecipes(){
    $('#recipeList').innerHTML = recipes.map((r,i) => `
      <button class="recipe" data-i="${i}">
        <div class="rh">${r.tag}</div>
        <div class="rt">${r.title}</div>
        <div class="rd">${r.desc}</div>
      </button>
    `).join('');
    $('#recipeList').querySelectorAll('.recipe').forEach(el => el.addEventListener('click', () => {
      const r = recipes[+el.dataset.i];
      $('#promptInput').value = r.prompt;
      $('#runTitle').value = r.title.replace(/<[^>]+>/g, '');
      $('#sysInput').value = sysPresets[r.sys] || sysPresets.reset;
      $('#sysPreview').textContent = $('#sysInput').value.slice(0,120);
      // mode
      $$('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === r.mode));
      mode = r.mode;
      $('#modeHelp').textContent = modeHelp[mode];
      $('#outModeTag').textContent = mode==='single'?'Single shot':mode==='compare'?'Compare':'Conversation';
      syncModePick();
      renderOutputShell();
      // ctx
      $$('.ctx-chip').forEach(c => c.classList.remove('on'));
      (r.ctx || []).forEach(cx => { const el2 = document.querySelector(`.ctx-chip[data-ctx="${cx}"]`); if(el2) el2.classList.add('on'); });
      detectVars();
      window.scrollTo({top:0, behavior:'smooth'});
      toast('Recipe loaded — review and Run.', true);
    }));
  }
  $('#recipesBtn').addEventListener('click', () => {
    document.querySelector('.side-pane .pane:last-child').scrollIntoView({behavior:'smooth', block:'center'});
  });

  // ============ CLEAR ============
  $('#clearBtn').addEventListener('click', () => {
    $('#promptInput').value = '';
    $('#runTitle').value = '';
    conversation = [];
    detectVars();
    renderOutputShell();
    toast('Cleared.');
  });

  // ============ HISTORY ============
  function renderRuns(filter=''){
    const list = $('#runsList');
    const cnt = $('#runCount');
    const f = filter.trim().toLowerCase();
    const visible = sessionRuns.filter(r => !f || (r.title || r.prompt).toLowerCase().includes(f));
    cnt.textContent = sessionRuns.length;
    if(visible.length === 0){
      list.innerHTML = '<div class="hist-empty">' + (sessionRuns.length === 0 ? 'Recent runs appear here. Save the keepers — the rest fade in 24 hours.' : 'No runs match that filter.') + '</div>';
      return;
    }
    list.innerHTML = visible.map((r,i) => `
      <div class="hist-card ${r.saved?'saved':''}" data-idx="${sessionRuns.indexOf(r)}">
        <div class="hc-top">
          <span class="hc-time">${timeAgo(r.ts)}</span>
          <span class="hc-mode">${r.mode}</span>
          <span class="hc-models">${r.models.map(m => `<span class="d" style="background:${modelMeta[m].color}"></span>`).join('')}</span>
        </div>
        <div class="hc-prompt">${escapeHtml(r.title || r.prompt.slice(0,90))}</div>
        <div class="hc-foot">
          <span class="hc-exp">${r.saved?'✓ saved · v1':'expires in '+(24-Math.floor((Date.now()-r.ts)/(1000*60*60)))+'h'}</span>
          <span class="hc-save" data-idx="${sessionRuns.indexOf(r)}">${r.saved?'✓':'☆'}</span>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('.hc-save').forEach(el => el.addEventListener('click', e => {
      e.stopPropagation();
      sessionRuns[+el.dataset.idx].saved = true;
      renderRuns($('#histSearch').value);
      toast('Saved to toolbox · v1', true);
    }));
    list.querySelectorAll('.hist-card').forEach(el => el.addEventListener('click', () => {
      const r = sessionRuns[+el.dataset.idx];
      $('#promptInput').value = r.prompt;
      $('#runTitle').value = r.title;
      detectVars();
      // restore mode
      $$('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === r.mode));
      mode = r.mode;
      $('#modeHelp').textContent = modeHelp[mode];
      $('#outModeTag').textContent = mode==='single'?'Single shot':mode==='compare'?'Compare':'Conversation';
      syncModePick();
      restoreOutput(r);
      window.scrollTo({top:0, behavior:'smooth'});
    }));
  }
  $('#histSearch').addEventListener('input', e => renderRuns(e.target.value));

  // ============ OUTPUT RENDERING ============
  function renderOutputShell(){
    const grid = $('#outGrid');
    const conv = $('#convBox');
    if(mode === 'conv'){
      grid.style.display = 'none';
      conv.style.display = 'block';
      renderConv();
    } else {
      grid.style.display = 'grid';
      conv.style.display = 'none';
      const cols = mode === 'compare' ? compareModels.length : 1;
      grid.className = 'out-grid cols-' + cols;
      grid.innerHTML = '<div class="out-empty">Your output will land here. Nothing is saved unless you tell it to be — runs auto-discard in <em>24 hours.</em></div>';
    }
    $('#outMeta').style.display = 'none';
  }

  function renderConv(){
    const c = $('#convBody');
    if(conversation.length === 0){
      c.innerHTML = '<div class="conv-empty">Start the conversation. The model holds context across turns until you Clear.</div>';
      return;
    }
    c.innerHTML = conversation.map(t => `
      <div class="turn ${t.role === 'user' ? 'user' : 'bot'}">
        <span class="who">${t.role === 'user' ? 'You' : modelMeta[t.model || model].label}</span>
        <div class="body">${escapeHtml(t.content)}</div>
      </div>
    `).join('');
    c.scrollTop = c.scrollHeight;
  }

  function flagsFor(text, m){
    const flags = [];
    if(controls.guards.includes('redact') && /\d{3}-\d{2}-\d{4}|\b\d{9,16}\b/.test(text)){
      flags.push({k:'warn', t:'PII detected'});
    } else if(controls.guards.includes('redact')){
      flags.push({k:'ok', t:'No PII'});
    }
    if(controls.guards.includes('reg')){
      const bad = /(deny|denied)\b/i.test(text);
      flags.push(bad ? {k:'warn', t:'Reg B watch: "deny"'} : {k:'ok', t:'Reg B clear'});
    }
    flags.push({k:'ok', t:m + ' · ' + Math.ceil(text.split(/\s+/).length) + ' words'});
    return flags;
  }

  function renderCard(idx, m, text, took, isLoading){
    const meta = modelMeta[m];
    const flags = isLoading ? [] : flagsFor(text, meta.short);
    const cost = isLoading ? '—' : '$'+(text.length/1000 * meta.cost).toFixed(4);
    const tokens = isLoading ? '—' : Math.ceil(text.length/4) + ' tok';
    return `<div class="out-card" data-idx="${idx}">
      <div class="oc-head">
        <span class="mp-dot ${m}" style="background:${meta.color}"></span>
        <span class="oc-model">${meta.label}</span>
        <span class="oc-meta">${isLoading?'thinking…':(took/1000).toFixed(1)+'s · '+tokens+' · '+cost}</span>
      </div>
      <div class="oc-body">${isLoading ? '<span class="oc-typing">Thinking…</span>' : `<span class="text">${escapeHtml(text)}</span>`}</div>
      ${flags.length ? `<div class="oc-flags">${flags.map(f => `<span class="flag ${f.k}">${f.t}</span>`).join('')}</div>` : ''}
      <div class="oc-foot">
        ${mode === 'compare' ? `<button class="oc-act win-btn" data-idx="${idx}">Pick winner ★</button>` : ''}
        <button class="oc-act save-btn" data-idx="${idx}">Save to toolbox</button>
        <button class="oc-act iter-btn" data-idx="${idx}">Iterate</button>
        <button class="oc-act share-btn" data-idx="${idx}">Share</button>
        <span class="oc-spacer"></span>
        <button class="oc-act sub copy-btn" data-idx="${idx}">Copy</button>
      </div>
    </div>`;
  }

  function bindCards(){
    $$('.win-btn').forEach(b => b.addEventListener('click', () => {
      $$('.out-card').forEach(c => c.querySelector('.win-btn')?.classList.remove('win'));
      b.classList.add('win');
      b.textContent = '★ Winner';
      toast('Marked as winner. Tap Save to send to toolbox.', true);
    }));
    $$('.save-btn').forEach(b => b.addEventListener('click', () => openSave(+b.dataset.idx)));
    $$('.iter-btn').forEach(b => b.addEventListener('click', () => {
      const cur = $$('.out-card .text')[+b.dataset.idx]?.textContent || '';
      const ta = $('#promptInput');
      ta.value += '\n\n---\nIterate on this draft:\n' + cur.slice(0,300) + '…\n\nNow: ';
      ta.focus();
      ta.scrollTop = ta.scrollHeight;
      window.scrollTo({top:0, behavior:'smooth'});
    }));
    $$('.share-btn').forEach(b => b.addEventListener('click', () => toast('Share link copied to clipboard.', true)));
    $$('.copy-btn').forEach(b => b.addEventListener('click', () => {
      const t = $$('.out-card .text')[+b.dataset.idx]?.textContent || '';
      navigator.clipboard?.writeText(t);
      toast('Copied.', true);
    }));
  }

  function restoreOutput(r){
    const grid = $('#outGrid');
    const conv = $('#convBox');
    if(r.mode === 'conv'){
      grid.style.display = 'none';
      conv.style.display = 'block';
      conversation = r.conversation || [];
      renderConv();
    } else {
      grid.style.display = 'grid';
      conv.style.display = 'none';
      const cols = r.outputs.length;
      grid.className = 'out-grid cols-' + cols;
      grid.innerHTML = r.outputs.map((o,i) => renderCard(i, o.model, o.text, o.took, false)).join('');
      bindCards();
      $('#outMeta').style.display = 'flex';
      $('#outTime').textContent = (r.outputs.reduce((a,b) => Math.max(a, b.took), 0)/1000).toFixed(1)+'s';
      $('#outTok').textContent = Math.ceil(r.outputs.reduce((a,b) => a + b.text.length, 0)/4)+' tok';
      $('#outCost').textContent = '$'+r.outputs.reduce((a,b) => a + (b.text.length/1000)*modelMeta[b.model].cost, 0).toFixed(4);
    }
  }

  // ============ RUN ============
  function buildSystem(){
    let s = $('#sysInput').value.trim();
    const ctx = [...$$('.ctx-chip.on')].map(c => c.textContent.trim()).filter(Boolean);
    if(ctx.length) s += '\n\nAttached context: ' + ctx.join(', ') + '. Treat these as the source material.';
    s += '\n\nFormat: ' + controls.format + '. Length: ' + controls.length + '. Tone: ' + controls.tone + '.';
    if(controls.guards.includes('redact')) s += ' Redact PII in your response.';
    if(controls.guards.includes('reg')) s += ' Flag any Reg B / fair-lending exposure.';
    return s;
  }

  async function runOne(prompt, m){
    const t0 = Date.now();
    let resp = '';
    try{
      const sys = buildSystem();
      // Use a single global helper but tag each output with the chosen model label.
      resp = await window.claude.complete({
        messages: [{ role:'user', content: sys + '\n\n---\n\n[Pretend you are ' + modelMeta[m].label + '. Adopt the house voice it is known for.]\n\n' + prompt }]
      });
    } catch(e){
      resp = 'Run failed. ' + (e?.message || e);
    }
    return { model:m, text:resp, took: Date.now() - t0 };
  }

  async function doRun(){
    const rawPrompt = $('#promptInput').value.trim();
    if(!rawPrompt) return toast('Write a prompt first.');
    const prompt = fillVars(rawPrompt);
    const title = $('#runTitle').value.trim();
    const runBtn = $('#runBtn');
    runBtn.disabled = true;
    const orig = runBtn.innerHTML;
    runBtn.innerHTML = 'Running…';

    if(mode === 'conv'){
      conversation.push({ role:'user', content: prompt });
      renderConv();
      const t0 = Date.now();
      let resp = '';
      try{
        const sys = buildSystem();
        const msgs = [{role:'user', content: sys + '\n\n---\n\nConversation so far:\n' + conversation.map(t => (t.role==='user'?'USER: ':'ASSISTANT: ') + t.content).join('\n\n') + '\n\nRespond as the assistant to the latest user message.'}];
        resp = await window.claude.complete({ messages: msgs });
      } catch(e){ resp = 'Run failed. ' + (e?.message || e); }
      conversation.push({ role:'assistant', content: resp, model });
      renderConv();
      lastRun = { ts:Date.now(), title, prompt:rawPrompt, mode:'conv', models:[model], conversation:[...conversation], saved:false };
      sessionRuns.unshift(lastRun);
    } else {
      const grid = $('#outGrid');
      const ms = mode === 'compare' ? compareModels : [model];
      grid.className = 'out-grid cols-' + ms.length;
      grid.innerHTML = ms.map((m,i) => renderCard(i, m, '', 0, true)).join('');
      $('#outMeta').style.display = 'none';

      const results = await Promise.all(ms.map(m => runOne(prompt, m).then(r => {
        // progressively render
        const idx = ms.indexOf(m);
        const card = grid.querySelectorAll('.out-card')[idx];
        if(card) card.outerHTML = renderCard(idx, m, r.text, r.took, false);
        bindCards();
        return r;
      })));
      // final meta
      $('#outMeta').style.display = 'flex';
      $('#outTime').textContent = (Math.max(...results.map(r => r.took))/1000).toFixed(1)+'s';
      const totalChars = results.reduce((a,b) => a + b.text.length, 0);
      $('#outTok').textContent = Math.ceil(totalChars/4)+' tok';
      $('#outCost').textContent = '$'+results.reduce((a,b) => a + (b.text.length/1000)*modelMeta[b.model].cost, 0).toFixed(4);

      lastRun = { ts:Date.now(), title, prompt:rawPrompt, mode, models: ms, outputs:results, saved:false };
      sessionRuns.unshift(lastRun);
    }
    if(sessionRuns.length > 12) sessionRuns = sessionRuns.slice(0,12);
    renderRuns($('#histSearch').value);

    runBtn.disabled = false;
    runBtn.innerHTML = orig;
  }
  $('#runBtn').addEventListener('click', doRun);
  // ⌘↵ shortcut
  document.addEventListener('keydown', e => {
    if((e.metaKey || e.ctrlKey) && e.key === 'Enter'){
      e.preventDefault();
      doRun();
    }
  });

  // ============ SAVE MODAL ============
  function openSave(idx){
    saveType = 'prompt';
    $$('#saveType button').forEach(b => b.classList.toggle('sel', b.dataset.t === 'prompt'));
    $('#saveName').value = $('#runTitle').value || '';
    $('#saveDesc').value = '';
    $('#saveModal').classList.add('open');
    $('#saveBg').classList.add('open');
  }
  function closeSave(){ $('#saveModal').classList.remove('open'); $('#saveBg').classList.remove('open'); }
  $('#saveClose').addEventListener('click', closeSave);
  $('#saveCancel').addEventListener('click', closeSave);
  $('#saveBg').addEventListener('click', closeSave);
  $$('#saveType button').forEach(b => b.addEventListener('click', () => {
    $$('#saveType button').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
    saveType = b.dataset.t;
  }));
  $('#saveDo').addEventListener('click', () => {
    if(!$('#saveName').value.trim()) return toast('Give it a name.');
    if(lastRun) lastRun.saved = true;
    closeSave();
    renderRuns($('#histSearch').value);
    toast('Saved to toolbox · ' + saveType + ' · v1', true);
  });

  // ============ INIT ============
  syncModePick();
  detectVars();
  renderRecipes();
  renderRuns();
  renderOutputShell();

  // First-run suggestion
  $('#promptInput').value = "Take this credit memo and write three honest critiques a senior underwriter would make. Be specific about {{borrower}} — cite the line.";
  $('#runTitle').value = 'Stress-test memo';
  detectVars();
  varVals.borrower = 'Riverbend Custom Cabinetry';
  detectVars();
})();
