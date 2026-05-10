  // animate score ring + count-up
  (function(){
    const total = 48, score = 32;
    const pct = score / total;
    const circ = 2 * Math.PI * 50;
    const ring = document.getElementById('ring');
    const num = document.getElementById('scoreNum');

    requestAnimationFrame(()=>{
      if(ring) ring.style.strokeDashoffset = (circ * (1 - pct)).toFixed(2);
    });

    let start = null, dur = 1400;
    function tick(t){
      if(!start) start = t;
      const p = Math.min(1, (t - start)/dur);
      const eased = 1 - Math.pow(1 - p, 3);
      num.textContent = Math.round(eased * score);
      if(p < 1) requestAnimationFrame(tick);
    }
    setTimeout(()=>requestAnimationFrame(tick), 400);

    /* ============ TWEAKS ============ */
    const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
      "direction": "ledger",
      "mark": "word",
      "grain": true,
      "headline": "sans"
    }/*EDITMODE-END*/;
    const tweaks = Object.assign({}, TWEAK_DEFAULTS);

    const MARK_TPL = {
      lockup: '<div class="m-lockup"><div class="ml-1">AiBI</div><div class="ml-2">The AI Banking Institute</div></div>',
      seal:   '<div class="m-seal"><div class="ms-1">AiBI</div><div class="ms-2">EST · 2026</div></div>',
      mono:   '<div class="m-mono"><div class="mm-1">AI<br>BI</div><div class="mm-2">Institute</div></div>',
      word:   '<div class="m-word"><div class="mw-1">The AI Banking</div><div class="mw-2">Institute</div></div>',
      chip:   '<div class="m-chip"><span>AiBI</span><i></i><span>Institute</span></div>',
      glyph:  '<div class="m-glyph"><svg class="mg-icon" viewBox="0 0 32 32" width="34" height="34" fill="none"><rect x="3" y="3" width="26" height="26" stroke="currentColor" stroke-width="1.5"/><path d="M3 29 L29 3" stroke="currentColor" stroke-width="1.5"/></svg><div class="mg-text"><div>AiBI</div><div>The AI Banking Institute</div></div></div>'
    };

    function applyTweaks(){
      document.body.dataset.direction = tweaks.direction;
      document.body.dataset.mark = tweaks.mark;
      document.body.dataset.grain = tweaks.grain ? 'on' : 'off';
      document.body.dataset.headline = tweaks.headline;
      const slot = document.getElementById('markSlot');
      if(slot) slot.innerHTML = MARK_TPL[tweaks.mark] || MARK_TPL.lockup;
    }

    function setTweak(k, v){
      tweaks[k] = v;
      applyTweaks();
      try{ window.parent.postMessage({type:'__edit_mode_set_keys', edits:{[k]:v}}, '*'); }catch(_){}
      renderPanel();
    }

    function renderPanel(){
      const p = document.getElementById('tweakPanel');
      if(!p) return;
      p.innerHTML = `
        <header>
          <h4>Tweaks · Brand</h4>
          <button class="x" id="tweakClose" aria-label="Close">×</button>
        </header>
        <section>
          <span class="lbl">Direction</span>
          <div class="swatches">
            ${[
              {v:'editorial', n:'Editorial', c:['#EFE9DC','#1A1713','#8E3B2A']},
              {v:'ledger',    n:'Ledger',    c:['#ECE9DF','#0E1B2D','#B5862A']},
              {v:'signal',    n:'Signal',    c:['#F4F4F4','#0A0A0A','#2A4DFF']},
              {v:'field',     n:'Field',     c:['#E8E3D4','#162619','#7A9A7E']}
            ].map(d => `
              <button class="sw" data-key="direction" data-v="${d.v}" aria-pressed="${tweaks.direction===d.v}">
                <span class="bars">
                  <span style="background:${d.c[0]}"></span>
                  <span style="background:${d.c[1]}"></span>
                  <span style="background:${d.c[2]}"></span>
                </span>
                <span class="nm">${d.n}</span>
              </button>`).join('')}
          </div>
        </section>
        <section>
          <span class="lbl">Brand mark</span>
          <div class="marks">
            ${[
              {v:'lockup', n:'Lockup'},
              {v:'glyph',  n:'Glyph + Type'},
              {v:'seal',   n:'Square Seal'},
              {v:'mono',   n:'Monogram'},
              {v:'word',   n:'Wordmark'},
              {v:'chip',   n:'Pill Badge'}
            ].map(m => `
              <button class="mk" data-key="mark" data-v="${m.v}" aria-pressed="${tweaks.mark===m.v}">${m.n}</button>
            `).join('')}
          </div>
        </section>
        <section>
          <span class="lbl">Headline style</span>
          <div class="seg">
            <button data-key="headline" data-v="serif" aria-pressed="${tweaks.headline==='serif'}">Serif italic</button>
            <button data-key="headline" data-v="sans"  aria-pressed="${tweaks.headline==='sans'}">Sans display</button>
          </div>
        </section>
        <section>
          <span class="lbl">Paper grain</span>
          <label class="switch">
            <input type="checkbox" id="grainToggle" ${tweaks.grain ? 'checked' : ''}>
            <span>${tweaks.grain ? 'On' : 'Off'}</span>
          </label>
        </section>
      `;
      p.querySelectorAll('button[data-key]').forEach(b => {
        b.addEventListener('click', () => setTweak(b.dataset.key, b.dataset.v));
      });
      const gT = p.querySelector('#grainToggle');
      if(gT) gT.addEventListener('change', e => setTweak('grain', e.target.checked));
      const cl = p.querySelector('#tweakClose');
      if(cl) cl.addEventListener('click', () => {
        document.getElementById('tweakPanel').dataset.open = 'false';
        try{ window.parent.postMessage({type:'__edit_mode_dismissed'}, '*'); }catch(_){}
      });
    }

    window.addEventListener('message', (e) => {
      const t = e?.data?.type;
      if(t === '__activate_edit_mode'){
        document.getElementById('tweakPanel').dataset.open = 'true';
        renderPanel();
      } else if(t === '__deactivate_edit_mode'){
        document.getElementById('tweakPanel').dataset.open = 'false';
      }
    });

    applyTweaks();
    renderPanel();
    try{ window.parent.postMessage({type:'__edit_mode_available'}, '*'); }catch(_){}


    // animate dimension bars when in view
    const dims = document.querySelectorAll('.dim');
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const pct = e.target.getAttribute('data-pct');
          const i = e.target.querySelector('.bar > i');
          if(i) i.style.width = pct + '%';
          io.unobserve(e.target);
        }
      });
    },{threshold:0.4});
    dims.forEach(d => io.observe(d));

    // copy prompt
    const btn = document.getElementById('copyBtn');
    const pre = document.getElementById('promptText');
    if(btn && pre){
      btn.addEventListener('click', async ()=>{
        try{
          await navigator.clipboard.writeText(pre.innerText);
          const orig = btn.textContent;
          btn.textContent = 'Copied ✓';
          setTimeout(()=>btn.textContent = orig, 1400);
        }catch(err){ btn.textContent = 'Select & copy'; }
      });
    }

    const dlBtn = document.getElementById('downloadBtn');
    if(dlBtn && pre){
      dlBtn.addEventListener('click', () => {
        const blob = new Blob([pre.innerText], {type:'text/markdown'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'aibi-email-rewrite-prompt.md';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url), 1000);
        const orig = dlBtn.textContent;
        dlBtn.textContent = 'Saved ✓';
        setTimeout(()=>dlBtn.textContent = orig, 1400);
      });
    }
  })();
