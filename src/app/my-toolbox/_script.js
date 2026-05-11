/* eslint-disable @typescript-eslint/no-unused-vars */
  // ----- drawer plumbing -----
  const drBg     = document.getElementById('drawerBg');
  const askDr    = document.getElementById('askDrawer');
  const artDr    = document.getElementById('artDrawer');
  const closeAll = () => { askDr.classList.remove('open'); artDr.classList.remove('open'); drBg.classList.remove('open'); };
  drBg.addEventListener('click', closeAll);
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeAll));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  // open ask drawer
  document.getElementById('askFab').addEventListener('click', () => {
    closeAll();
    askDr.classList.add('open'); drBg.classList.add('open');
    setTimeout(() => document.getElementById('askInput').focus(), 250);
  });
  // ===== PINS — persistent, drives reorder + sidebar pinned list =====
  const PIN_KEY = 'aibi_toolbox_pins';
  const loadPins = () => { try { return new Set(JSON.parse(localStorage.getItem(PIN_KEY) || '[]')); } catch { return new Set(); } };
  const savePins = (set) => localStorage.setItem(PIN_KEY, JSON.stringify([...set]));
  let pinned = loadPins();
  function applyPins(){
    document.querySelectorAll('.card').forEach(card => {
      const id = card.dataset.id || (card.dataset.id = (card.querySelector('h3')?.textContent || '').trim());
      const pin = card.querySelector('.pin');
      const on = pinned.has(id);
      if (pin){ pin.classList.toggle('on', on); pin.textContent = on ? '★' : '☆'; }
    });
  }
  applyPins();

  // ===== FILTER STATE =====
  const state = { type: 'all', source: 'all', q: '' };

  function applyFilters(){
    const q = state.q.trim().toLowerCase();
    let visible = 0;
    document.querySelectorAll('.card').forEach(card => {
      // type
      const matchType = state.type === 'all'
        || (state.type === 'prompt'   && card.classList.contains('t-prompt'))
        || (state.type === 'skill'    && card.classList.contains('t-skill'))
        || (state.type === 'agent'    && card.classList.contains('t-agent'))
        || (state.type === 'playbook' && card.classList.contains('t-playbook'));
      // source
      const matchSrc = state.source === 'all'
        || (state.source === 'mine' && card.querySelector('.src.mine'))
        || (state.source === 'inst' && card.querySelector('.src.inst'))
        || (state.source === 'role' && card.querySelector('.src.role'));
      // search
      const text = card.textContent.toLowerCase();
      const matchQ = !q || text.includes(q);

      const show = matchType && matchSrc && matchQ;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    // hide empty groups
    document.querySelectorAll('.group-head').forEach(head => {
      let next = head.nextElementSibling;
      const grid = next && next.classList.contains('grid') ? next : null;
      if (!grid) return;
      const hasVisible = [...grid.querySelectorAll('.card')].some(c => c.style.display !== 'none');
      head.classList.toggle('empty', !hasVisible);
      grid.style.display = hasVisible ? '' : 'none';
    });
    // empty state
    let nr = document.getElementById('noResults');
    if (!visible){
      if (!nr){
        nr = document.createElement('div');
        nr.id = 'noResults';
        nr.className = 'no-results';
        nr.innerHTML = 'Nothing matches. Try <em>clearing filters</em> or change the search.';
        document.querySelector('.work').appendChild(nr);
      }
      nr.style.display = '';
    } else if (nr){ nr.style.display = 'none'; }
  }

  // open artifact drawer on card click; star toggles pin
  function bindCard(card){
    card.addEventListener('click', e => {
      if (e.target.closest('.pin')){
        const id = card.dataset.id || card.querySelector('h3')?.textContent.trim();
        if (pinned.has(id)) pinned.delete(id); else pinned.add(id);
        savePins(pinned); applyPins(); return;
      }
      closeAll();
      artDr.classList.add('open'); drBg.classList.add('open');
    });
  }
  document.querySelectorAll('.card').forEach(bindCard);

  // ===== FILTER CHIPS =====
  document.querySelectorAll('.fset').forEach(set => {
    set.querySelectorAll('.fchip').forEach(c => c.addEventListener('click', () => {
      set.querySelectorAll('.fchip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      if (c.dataset.f) state.type = c.dataset.f;
      if (c.dataset.s) state.source = c.dataset.s;
      applyFilters();
    }));
  });
  // sidebar Source rows act like a filter chip set
  document.querySelectorAll('[data-side-s]').forEach(r => r.addEventListener('click', () => {
    document.querySelectorAll('[data-side-s]').forEach(x => x.classList.remove('active'));
    r.classList.add('active');
    state.source = r.dataset.sideS;
    applyFilters();
  }));
  // generic side rows just toggle visual active
  document.querySelectorAll('.srow:not([data-side-s])').forEach(r => r.addEventListener('click', () => { r.classList.toggle('active'); }));
  // search
  document.getElementById('searchBox').addEventListener('input', e => { state.q = e.target.value; applyFilters(); });

  // ===== NEW ASSET MODAL =====
  const mBg = document.getElementById('modalBg');
  const mEl = document.getElementById('newModal');
  const openModal  = () => { mBg.classList.add('open'); mEl.classList.add('open'); setTimeout(() => document.getElementById('nmName').focus(), 200); };
  const closeModal = () => { mBg.classList.remove('open'); mEl.classList.remove('open'); };
  document.getElementById('newBtn').addEventListener('click', openModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  mBg.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  let pickedType = 'prompt';
  document.querySelectorAll('#nmTypes button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#nmTypes button').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel'); pickedType = b.dataset.t;
  }));

  document.getElementById('modalSave').addEventListener('click', () => {
    const name = document.getElementById('nmName').value.trim() || 'Untitled';
    const desc = document.getElementById('nmDesc').value.trim() || 'No description yet.';
    // create a card and prepend to first grid
    const tClass = 't-' + pickedType;
    const tLabel = pickedType[0].toUpperCase() + pickedType.slice(1);
    const card = document.createElement('article');
    card.className = 'card ' + tClass;
    card.innerHTML = `
      <div class="card-top"><span class="ttag">${tLabel}</span><span class="vtag">v <strong>1</strong></span><button class="pin">☆</button></div>
      <h3>${name.replace(/<[^>]+>/g,'')}</h3>
      <p class="desc">${desc.replace(/<[^>]+>/g,'')}</p>
      <div class="card-foot"><span class="src mine">Mine</span><span>—</span><span class="uses">Used 0×</span><span class="fresh new">New</span></div>`;
    document.querySelector('.grid').prepend(card);
    bindCard(card);
    // reset & close
    document.getElementById('nmName').value = '';
    document.getElementById('nmDesc').value = '';
    document.getElementById('nmBody').value = '';
    closeModal();
    // flash
    card.style.outline = '2px solid var(--terra)';
    setTimeout(() => card.style.outline = '', 900);
  });

  // ----- ASK assistant (Claude-backed) -----
  const askInput = document.getElementById('askInput');
  const askForm  = document.getElementById('askForm');
  const askSend  = document.getElementById('askSend');
  const askModel = document.getElementById('askModel');
  const ansBox   = document.getElementById('askAnswer');
  const ansLab   = document.getElementById('answerLab');
  const ansBody  = document.getElementById('answerBody');

  const TOOLBOX_CONTEXT = `You are the personal toolbox assistant for D. Maxwell, a BSA officer at a community credit union enrolled in The AI Banking Institute's Foundations program. Their toolbox holds 47 reusable AI assets across four types: 28 prompts, 11 skills, 5 agents, 3 playbooks.

Most-used items:
- "Tone match: dry banker" (skill, v4, used 31×)
- "SAR-grade narrative frame" (prompt, v5, used 23×)
- "Past-tense, third-person rewrite" (prompt, v3, used 18×)
- "Extract amounts & dates → table" (skill, v2, used 15×)
- "Credit memo · 4-prompt scaffold" (prompt, v3, used 12×)
- "BSA tense + voice check" (skill, v4, used 11×)
- "Compress to 200 words" (skill, v1, used 8×)

Playbooks: BSA officer starter kit (role, 9 items, 14 runs); Credit-shop playbook (mine, 7 items, 11 runs); Board-summary toolkit (mine, 5 items, 5 runs).

Voice: editorial, dry, banker-credible. Short sentences. No marketing verbs. When citing assets, use their names. Keep responses under 160 words unless explicitly asked for length. Plain text, no markdown headings.`;

  async function ask(question){
    ansBox.classList.add('show');
    const modelLabel = askModel.options[askModel.selectedIndex].text;
    ansLab.textContent = 'Answer · ' + modelLabel;
    ansBody.textContent = '';
    ansBody.classList.add('typing');
    askSend.disabled = true; askSend.textContent = 'Thinking…';

    try {
      const reply = await window.claude.complete({
        messages: [{ role:'user', content: TOOLBOX_CONTEXT + '\n\n— — —\n\nQuestion: ' + question }]
      });
      ansBody.classList.remove('typing');
      const text = (reply || '').trim();
      let i = 0;
      const tick = () => {
        if (i >= text.length){ askSend.disabled = false; askSend.textContent = 'Ask →'; return; }
        ansBody.textContent += text.slice(i, i + 4); i += 4;
        requestAnimationFrame(tick);
      };
      tick();
    } catch(err){
      ansBody.classList.remove('typing');
      ansBody.textContent = '(Couldn\'t reach the assistant. Try again.)';
      askSend.disabled = false; askSend.textContent = 'Ask →';
    }
  }

  askForm.addEventListener('submit', e => { e.preventDefault(); const q = askInput.value.trim(); if (q) ask(q); });
  document.querySelectorAll('.sug button').forEach(b => b.addEventListener('click', () => { askInput.value = b.dataset.q; ask(b.dataset.q); }));

  // artifact drawer AI actions
  document.querySelectorAll('.ad-act').forEach(b => b.addEventListener('click', () => {
    const map = {
      open: 'Open my SAR-grade narrative frame in the workspace and pre-fill it with placeholders for: account number, date range, amounts, observed pattern.',
      iter: 'Iterate my SAR-grade narrative frame. Suggest 3 specific tweaks and show me what v 6 would look like.',
      critique: 'Critique my SAR-grade narrative frame as a senior BSA officer. Where is it weak? What might an examiner question?',
      add: 'Suggest which of my playbooks the SAR-grade narrative frame belongs in, and tell me why.'
    };
    closeAll();
    askDr.classList.add('open'); drBg.classList.add('open');
    setTimeout(() => { askInput.value = map[b.dataset.run]; ask(map[b.dataset.run]); }, 250);
  }));
