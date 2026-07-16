// Scoped Mockup-system styles. Built off the migrated dashboard layout that
// originally shipped in the Ledger-era /dashboard port. All Ledger tokens
// have been swapped to mockup tokens (--ink, --gold, --cream, slate scale).
// Italics are retired — emphasis carried by weight. UPPER CASE button
// labels per brand spec.
export const dashboardStyles = `
  .mockup-dash{
    --paper:var(--cream);
    --paper-2:var(--cream-2);
    --ink:var(--ink);
    --ink-2:var(--ink-2);
    --slate:var(--slate-500);
    --muted:var(--slate-500);
    --soft:var(--slate-400);
    --terra:var(--gold-deep);
    --terra-2:var(--gold-deep);
    --accent:var(--gold);
    --forest:var(--emerald-700);
    --weak:#9F3B1F;
    --rule:var(--ink-a10);
    --rule-strong:var(--ink-a15);
    --maxw:1280px;
    background:var(--cream); color:var(--ink);
    font-family:"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
    font-size:15px; line-height:1.55; position:relative;
  }
  .mockup-dash .container{ position:relative; z-index:1; max-width:var(--maxw); margin:0 auto; padding:0 32px }
  .mockup-dash .eyebrow{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }

  .mockup-dash .btn{ display:inline-flex; align-items:center; gap:10px; padding:14px 22px; border:1px solid transparent; font-size:11px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; line-height:1; cursor:pointer; border-radius:12px; transition:background .15s,color .15s,border-color .15s,transform .12s; text-decoration:none }
  .mockup-dash .btn-primary{ background:var(--gold); color:var(--ink); border-color:var(--gold) }
  .mockup-dash .btn-primary:hover{ background:var(--gold-2); border-color:var(--gold-2) }
  .mockup-dash .btn-ghost{ background:transparent; color:var(--ink); border:1px solid var(--ink) }
  .mockup-dash .btn-ghost:hover{ background:var(--ink); color:#fff }
  .mockup-dash .btn-paper{ background:#fff; color:var(--ink); border:1px solid var(--slate-200) }
  .mockup-dash .btn-paper:hover{ background:var(--cream-2) }
  .mockup-dash .btn .arrow{ font-weight:600; font-size:14px; letter-spacing:0; text-transform:none }

  .mockup-dash .tabs{ background:transparent; border-bottom:1px solid var(--rule) }
  .mockup-dash .tabs-inner{ max-width:var(--maxw); margin:0 auto; padding:0 32px; display:flex; align-items:center; gap:0; flex-wrap:wrap }
  .mockup-dash .tab{ font-size:11px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:var(--slate-500); padding:16px 18px 14px; border-bottom:2px solid transparent; margin-bottom:-1px; display:inline-flex; align-items:center; gap:8px; text-decoration:none; transition:color .15s,border-color .15s }
  .mockup-dash .tab:hover{ color:var(--ink) }
  .mockup-dash .tab.active{ color:var(--ink); border-bottom-color:var(--gold) }
  .mockup-dash .tab .lock{ font-size:10px; color:var(--gold-deep); text-transform:none; letter-spacing:0.04em; font-weight:600 }
  .mockup-dash .dash-alert{ max-width:var(--maxw); margin:18px auto 0; padding:12px 32px; color:var(--slate-600); font-size:13px; font-weight:600 }

  .mockup-dash .welcome{ padding:72px 0 60px; border-bottom:1px solid var(--rule); position:relative; overflow:hidden }
  .mockup-dash .welcome .wgrid{ display:grid; grid-template-columns:1.35fr 1fr; gap:64px; align-items:center }
  .mockup-dash .welcome .greet{ color:var(--gold-deep); margin-bottom:18px; display:block }
  .mockup-dash .welcome h1{ font-weight:600; font-size:clamp(48px,5.8vw,84px); line-height:0.98; letter-spacing:-0.025em; margin:0 0 22px; max-width:14ch; color:var(--ink) }
  .mockup-dash .welcome h1 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .welcome .lede{ font-size:19px; line-height:1.55; color:var(--slate-600); max-width:46ch; margin:0 0 30px; font-weight:400 }
  .mockup-dash .welcome .ctas{ display:flex; gap:12px; flex-wrap:wrap }
  .mockup-dash .loading-card{ background:#fff; border:1px solid var(--rule-strong); border-radius:20px; padding:32px; max-width:680px; box-shadow:var(--shadow-card) }
  .mockup-dash .loading-line{ display:block; border-radius:999px; background:linear-gradient(90deg,var(--cream-2),#fff,var(--cream-2)); background-size:200% 100%; animation:dash-pulse 1.4s ease-in-out infinite; height:18px; margin-top:18px }
  .mockup-dash .loading-title{ height:58px; max-width:520px; border-radius:18px }
  .mockup-dash .loading-copy{ max-width:560px }
  .mockup-dash .loading-copy.short{ max-width:360px }
  @keyframes dash-pulse{ 0%{ background-position:0 0 } 100%{ background-position:-200% 0 } }

  /* Snapshot panel */
  .mockup-dash .welcome .snap{ background:#fff; border:1px solid var(--rule-strong); padding:22px 24px; margin:0 0 26px; max-width:560px; border-radius:16px; box-shadow:var(--shadow-card) }
  .mockup-dash .welcome .snap-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:0; align-items:start }
  .mockup-dash .welcome .snap-cell{ display:flex; flex-direction:column; gap:6px; padding:0 18px; border-left:1px solid var(--rule) }
  .mockup-dash .welcome .snap-cell:first-child{ padding-left:0; border-left:none }
  .mockup-dash .welcome .snap-cell:last-child{ padding-right:0 }
  .mockup-dash .welcome .snap-lab{ font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--slate-500); font-weight:700 }
  .mockup-dash .welcome .snap-tier{ font-size:22px; line-height:1.1; color:var(--gold-deep); font-weight:700; letter-spacing:-0.015em }
  .mockup-dash .welcome .snap-score{ font-size:26px; font-weight:700; color:var(--ink); line-height:1; font-variant-numeric:tabular-nums }
  .mockup-dash .welcome .snap-score-max{ font-size:14px; font-weight:500; color:var(--slate-500); margin-left:2px }
  .mockup-dash .welcome .snap-pct{ font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .welcome .snap-source{ font-size:15px; line-height:1.25; color:var(--ink); font-weight:600 }
  .mockup-dash .welcome .snap-meta{ font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .welcome .snap-foot{ font-size:14px; line-height:1.5; color:var(--slate-600); margin:18px 0 0; padding-top:14px; border-top:1px solid var(--rule); max-width:56ch }
  @media (max-width:640px){
    .mockup-dash .welcome .snap-row{ grid-template-columns:1fr; gap:18px }
    .mockup-dash .welcome .snap-cell{ padding:0; border-left:none; border-top:1px solid var(--rule); padding-top:14px }
    .mockup-dash .welcome .snap-cell:first-child{ border-top:none; padding-top:0 }
  }

  /* Activation ladder */
  .mockup-dash .welcome .progress{ background:#fff; border:1px solid var(--rule-strong); padding:32px 32px 28px; position:relative; border-radius:20px; box-shadow:var(--shadow-card) }
  .mockup-dash .welcome .progress .lab{ font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700; margin-bottom:14px; display:block }
  .mockup-dash .welcome .progress h4{ font-weight:600; font-size:22px; line-height:1.2; letter-spacing:-0.015em; margin:0 0 22px; max-width:28ch; color:var(--ink) }
  .mockup-dash .welcome .progress h4 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .welcome .progress .steps{ display:flex; flex-direction:column; gap:14px }
  .mockup-dash .welcome .progress .step{ display:grid; grid-template-columns:28px 1fr auto; gap:14px; align-items:center; padding:10px 0; border-top:1px solid var(--rule); text-decoration:none; color:inherit; transition:color .15s }
  .mockup-dash .welcome .progress a.step{ cursor:pointer }
  .mockup-dash .welcome .progress a.step:hover .t{ color:var(--gold-deep) }
  .mockup-dash .welcome .progress .step:first-child{ border-top:none; padding-top:0 }
  .mockup-dash .welcome .progress .step .pn{ width:28px; height:28px; border:1.4px solid var(--rule-strong); border-radius:50%; display:grid; place-items:center; font-size:11px; color:var(--slate-500); font-weight:700 }
  .mockup-dash .welcome .progress .step.done .pn{ background:var(--gold); border-color:var(--gold); color:var(--ink) }
  .mockup-dash .welcome .progress .step.now .pn{ border-color:var(--ink); color:var(--ink); border-width:2px }
  .mockup-dash .welcome .progress .step .t{ font-size:15px; line-height:1.35; color:var(--ink); font-weight:500 }
  .mockup-dash .welcome .progress .step .t strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .welcome .progress .step.locked .t{ color:var(--slate-500) }
  .mockup-dash .welcome .progress .step .meta{ font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .welcome .progress .step.done .meta{ color:var(--emerald-700); font-weight:700 }
  .mockup-dash .welcome .progress .step.now .meta{ color:var(--ink); font-weight:700 }

  .mockup-dash .sec{ padding:72px 0; border-bottom:1px solid var(--rule) }
  .mockup-dash .sec.shaded{ background:var(--cream-2) }
  .mockup-dash .sec.dark{ background:var(--ink); color:#fff; border-color:var(--on-dark-10) }
  .mockup-dash .sec.dark .sec-head h2{ color:#fff }
  .mockup-dash .sec.dark .sec-head h2 strong{ color:var(--gold-soft) }
  .mockup-dash .sec-head{ display:flex; align-items:flex-end; gap:24px; margin-bottom:40px; padding-bottom:16px; border-bottom:1px solid var(--ink-a15); flex-wrap:wrap }
  .mockup-dash .sec.dark .sec-head{ border-color:var(--on-dark-20) }
  .mockup-dash .sec-head h2{ font-weight:600; font-size:clamp(32px,3.4vw,44px); line-height:1.05; letter-spacing:-0.02em; margin:0; color:var(--ink) }
  .mockup-dash .sec-head h2 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .sec-head .more{ margin-left:auto; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold-deep); font-weight:700; text-decoration:none }
  .mockup-dash .sec-head .more:hover{ color:var(--ink) }
  .mockup-dash .sec.dark .sec-head .more{ color:var(--gold-soft) }
  .mockup-dash .sec-head.compact{ margin-bottom:22px }

  /* Your work */
  .mockup-dash .work-sec{ padding-top:48px; padding-bottom:48px; background:var(--cream) }
  .mockup-dash .work-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px }
  .mockup-dash .work-card{ background:#fff; border:1px solid var(--rule); border-radius:18px; padding:20px; min-height:190px; display:flex; flex-direction:column; gap:10px; text-decoration:none; color:inherit; box-shadow:var(--shadow-card); transition:transform .15s,border-color .15s,box-shadow .15s }
  .mockup-dash .work-card:hover{ transform:translateY(-3px); border-color:var(--gold); box-shadow:var(--shadow-hover) }
  .mockup-dash .work-kicker{ font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .work-value{ font-size:34px; line-height:1; color:var(--ink); font-weight:700; letter-spacing:-0.02em; font-variant-numeric:tabular-nums }
  .mockup-dash .work-label{ font-size:14px; line-height:1.45; color:var(--slate-600); font-weight:500 }
  .mockup-dash .work-action{ margin-top:auto; padding-top:12px; border-top:1px solid var(--rule); font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .work-action .arrow{ font-size:14px; letter-spacing:0; text-transform:none }

  /* Trio cards */
  .mockup-dash .trio-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px }
  .mockup-dash .vc{ padding:28px 24px 24px; background:#fff; border:1px solid var(--rule); border-radius:24px; display:flex; flex-direction:column; gap:18px; min-height:340px; position:relative; transition:transform .15s,box-shadow .15s,border-color .15s; cursor:pointer; text-decoration:none; color:inherit; box-shadow:var(--shadow-card) }
  .mockup-dash .vc:hover{ transform:translateY(-4px); border-color:var(--gold); box-shadow:var(--shadow-feature) }
  .mockup-dash .vc .illust{ height:120px; display:grid; place-items:center; padding-bottom:18px; border-bottom:1px solid var(--rule) }
  .mockup-dash .vc .illust svg{ width:100%; height:100%; max-width:130px; display:block }
  .mockup-dash .vc .step{ font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--slate-500); font-weight:700; display:flex; justify-content:space-between; align-items:baseline }
  .mockup-dash .vc .step strong{ color:var(--gold-deep); font-size:14px; letter-spacing:0; font-weight:700 }
  .mockup-dash .vc h3{ font-weight:600; font-size:24px; line-height:1.15; letter-spacing:-0.015em; margin:0; max-width:14ch; color:var(--ink) }
  .mockup-dash .vc h3 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .vc p{ font-size:15px; line-height:1.5; color:var(--slate-600); margin:0; max-width:32ch }
  .mockup-dash .vc .cta{ margin-top:auto; display:flex; justify-content:space-between; align-items:baseline; padding-top:16px; border-top:1px solid var(--rule); font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--ink); font-weight:700 }
  .mockup-dash .vc .cta b{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .vc .cta .arrow{ font-size:14px; color:var(--gold-deep); letter-spacing:0; text-transform:none; font-weight:700 }

  /* Rep card */
  .mockup-dash .rep-card{ display:grid; grid-template-columns:1.1fr 1fr; gap:0; border:1px solid var(--rule); background:#fff; border-radius:24px; overflow:hidden; box-shadow:var(--shadow-card) }
  .mockup-dash .rep-card .body{ padding:44px 48px; display:flex; flex-direction:column; gap:22px }
  .mockup-dash .rep-card .ts{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700; display:flex; align-items:center; gap:14px }
  .mockup-dash .rep-card .ts .dot{ width:6px; height:6px; background:var(--gold); border-radius:50%; flex:none }
  .mockup-dash .rep-card h3{ font-weight:600; font-size:clamp(30px,3.4vw,42px); line-height:1.05; letter-spacing:-0.02em; margin:0; max-width:18ch; color:var(--ink) }
  .mockup-dash .rep-card h3 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .rep-card .rep-lede{ font-size:17px; line-height:1.5; color:var(--slate-600); margin:0; max-width:42ch }
  .mockup-dash .rep-card .tags{ display:flex; gap:14px; flex-wrap:wrap; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .rep-card .tags span{ display:inline-flex; align-items:center; gap:6px }
  .mockup-dash .rep-card .tags span::before{ content:""; width:4px; height:4px; background:var(--gold); border-radius:50%; flex:none }
  .mockup-dash .rep-card .foot{ display:flex; justify-content:space-between; align-items:center; padding-top:22px; border-top:1px solid var(--rule); flex-wrap:wrap; gap:14px }
  .mockup-dash .rep-card .foot .est{ font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .rep-card .demo{ background:var(--cream-2); border-left:1px solid var(--rule); padding:36px 40px; display:flex; flex-direction:column; gap:18px; justify-content:center; min-height:300px }
  .mockup-dash .rep-card .demo .lbl{ font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--slate-500); font-weight:700; line-height:1.4 }
  .mockup-dash .rep-card .demo .lbl b{ color:var(--weak); font-weight:700 }
  .mockup-dash .rep-card .demo .lbl b.safe{ color:var(--emerald-700) }
  .mockup-dash .rep-card .demo .prompt{ font-family:"Inter", ui-sans-serif, system-ui, sans-serif; font-size:13px; line-height:1.55; color:var(--ink); padding:14px 16px; background:#fff; border:1px solid var(--rule); border-radius:12px; position:relative }
  .mockup-dash .rep-card .demo .prompt.risky{ border-left:3px solid var(--weak) }
  .mockup-dash .rep-card .demo .prompt.safe{ border-left:3px solid var(--emerald-700) }
  .mockup-dash .rep-card .demo .prompt mark{ background:rgba(159,59,31,0.14); color:var(--weak); padding:1px 4px; border-radius:3px }
  .mockup-dash .rep-card .demo .prompt mark.green{ background:rgba(4,120,87,0.14); color:var(--emerald-700) }
  .mockup-dash .rep-card .demo .arrow-down{ display:grid; place-items:center; color:var(--gold-deep); font-size:22px; line-height:1; font-weight:700 }

  /* In-depth card */
  .mockup-dash .indepth-card{ display:grid; grid-template-columns:1fr; gap:0; border:1px solid var(--rule); background:#fff; border-radius:24px; overflow:hidden; box-shadow:var(--shadow-card) }
  .mockup-dash .indepth-card .ic-body{ padding:44px 48px; display:flex; flex-direction:column; gap:18px }
  .mockup-dash .indepth-card .lab{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .indepth-card h3{ font-weight:600; font-size:clamp(28px,3vw,40px); line-height:1.05; letter-spacing:-0.02em; margin:0; max-width:22ch; color:var(--ink) }
  .mockup-dash .indepth-card p{ font-size:17px; line-height:1.55; color:var(--slate-600); margin:0; max-width:52ch }
  .mockup-dash .indepth-card .ctas{ display:flex; gap:12px; flex-wrap:wrap; padding-top:8px }

  /* Foundation dark card */
  .mockup-dash .found-card{ display:grid; grid-template-columns:1.1fr 1fr; gap:0; background:var(--ink); color:#fff; position:relative; overflow:hidden; border-radius:32px; box-shadow:var(--shadow-hero) }
  .mockup-dash .found-card .body{ padding:48px 52px; display:flex; flex-direction:column; gap:24px; position:relative; z-index:1 }
  .mockup-dash .found-card .lab{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-soft); font-weight:700 }
  .mockup-dash .found-card h3{ font-weight:600; font-size:clamp(36px,4vw,52px); line-height:1.02; letter-spacing:-0.02em; margin:0; max-width:14ch }
  .mockup-dash .found-card h3 strong{ color:var(--gold-soft); font-weight:700 }
  .mockup-dash .found-card .copy{ font-size:18px; line-height:1.55; color:var(--on-dark-70); margin:0; max-width:42ch }
  .mockup-dash .found-card .copy strong{ color:var(--gold-soft); font-weight:600 }
  .mockup-dash .found-card .ctas{ display:flex; gap:12px; flex-wrap:wrap; padding-top:14px }
  .mockup-dash .found-card .price{ display:flex; align-items:baseline; gap:14px; padding-top:18px; border-top:1px solid var(--on-dark-20); margin-top:auto }
  .mockup-dash .found-card .price .n{ font-weight:700; font-size:48px; letter-spacing:-0.025em; color:var(--gold-soft); line-height:1 }
  .mockup-dash .found-card .price .l{ font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--on-dark-65); font-weight:600; line-height:1.5 }
  .mockup-dash .found-card .price .l b{ color:#fff; font-weight:700; display:block }
  .mockup-dash .found-card .feat{ padding:48px 44px; background:var(--on-dark-08); border-left:1px solid var(--on-dark-10); display:flex; flex-direction:column; gap:0 }
  .mockup-dash .found-card .feat .ftxt{ font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-soft); font-weight:700; margin-bottom:18px }
  .mockup-dash .found-card .feat .it{ display:grid; grid-template-columns:30px 1fr auto; gap:14px; align-items:center; padding:14px 0; border-bottom:1px solid var(--on-dark-10); font-size:16px }
  .mockup-dash .found-card .feat .it:last-child{ border-bottom:none }
  .mockup-dash .found-card .feat .it .ico{ width:30px; height:30px; display:grid; place-items:center }
  .mockup-dash .found-card .feat .it .ico svg{ width:24px; height:24px; color:var(--gold) }
  .mockup-dash .found-card .feat .it .nm{ font-size:15px; color:#fff; font-weight:500; letter-spacing:-0.005em }
  .mockup-dash .found-card .feat .it .nm strong{ color:var(--gold-soft); font-weight:700 }
  .mockup-dash .found-card .feat .it .n{ font-size:10px; letter-spacing:0.18em; color:var(--on-dark-50); font-weight:600; text-transform:uppercase }

  /* Resource grid */
  .mockup-dash .res-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px }
  .mockup-dash .res-card{ background:#fff; border:1px solid var(--rule); border-radius:20px; padding:22px 22px 18px; display:flex; flex-direction:column; gap:14px; min-height:230px; position:relative; transition:transform .15s,box-shadow .15s,border-color .15s; cursor:pointer; text-decoration:none; color:inherit; box-shadow:var(--shadow-card) }
  .mockup-dash .res-card:hover{ transform:translateY(-4px); border-color:var(--gold); box-shadow:var(--shadow-hover) }
  .mockup-dash .res-card .ricon{ width:48px; height:48px; display:grid; place-items:center }
  .mockup-dash .res-card .ricon svg{ width:100%; height:100%; display:block }
  .mockup-dash .res-card .tag{ font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .res-card h4{ font-weight:600; font-size:19px; line-height:1.2; letter-spacing:-0.01em; margin:0; max-width:14ch; color:var(--ink) }
  .mockup-dash .res-card h4 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .res-card .fmeta{ margin-top:auto; padding-top:14px; border-top:1px solid var(--rule); display:flex; justify-content:space-between; align-items:baseline; font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }
  .mockup-dash .res-card .fmeta .arrow{ color:var(--gold-deep); font-size:14px; letter-spacing:0; text-transform:none; font-weight:700 }

  /* SAFE card */
  .mockup-dash .safe-card{ background:#fff; border:1px solid var(--rule); border-radius:24px; padding:0; display:grid; grid-template-columns:1.2fr 2fr auto; gap:0; align-items:stretch; overflow:hidden; box-shadow:var(--shadow-card) }
  .mockup-dash .safe-card .label{ padding:32px 36px; border-right:1px solid var(--rule); background:var(--cream); display:flex; flex-direction:column; gap:8px; justify-content:center }
  .mockup-dash .safe-card .label .lab{ font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold-deep); font-weight:700 }
  .mockup-dash .safe-card .label h3{ font-weight:600; font-size:30px; line-height:1.05; letter-spacing:-0.02em; margin:0; color:var(--ink) }
  .mockup-dash .safe-card .label h3 strong{ color:var(--gold-deep); font-weight:700 }
  .mockup-dash .safe-card .label .sub{ font-size:14px; color:var(--slate-500); margin-top:4px }
  .mockup-dash .safe-card .grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:0 }
  .mockup-dash .safe-card .cell{ padding:28px 22px; border-right:1px solid var(--rule); display:flex; flex-direction:column; gap:8px; min-height:160px }
  .mockup-dash .safe-card .cell:last-child{ border-right:none }
  .mockup-dash .safe-card .cell .letter{ font-weight:700; font-size:44px; line-height:0.9; letter-spacing:-0.025em; color:var(--gold-deep) }
  .mockup-dash .safe-card .cell .word{ font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--ink); font-weight:700 }
  .mockup-dash .safe-card .cell .desc{ font-size:14px; line-height:1.45; color:var(--slate-600); margin-top:4px }
  .mockup-dash .safe-card .cta-col{ padding:32px; border-left:1px solid var(--rule); display:flex; flex-direction:column; justify-content:center; gap:10px; background:var(--cream); min-width:200px }
  .mockup-dash .safe-card .cta-col .meta{ font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--slate-500); font-weight:600 }

  @media (max-width:1080px){
    .mockup-dash .welcome .wgrid{ grid-template-columns:1fr; gap:32px }
    .mockup-dash .trio-grid{ grid-template-columns:1fr }
    .mockup-dash .work-grid{ grid-template-columns:repeat(2,1fr) }
    .mockup-dash .rep-card{ grid-template-columns:1fr }
    .mockup-dash .rep-card .demo{ border-left:none; border-top:1px solid var(--rule) }
    .mockup-dash .found-card{ grid-template-columns:1fr }
    .mockup-dash .found-card .feat{ border-left:none; border-top:1px solid var(--on-dark-10) }
    .mockup-dash .res-grid{ grid-template-columns:repeat(2,1fr) }
    .mockup-dash .safe-card{ grid-template-columns:1fr }
    .mockup-dash .safe-card .label{ border-right:none; border-bottom:1px solid var(--rule) }
    .mockup-dash .safe-card .cta-col{ border-left:none; border-top:1px solid var(--rule) }
  }
  @media (max-width:640px){
    .mockup-dash .res-grid{ grid-template-columns:1fr }
    .mockup-dash .work-grid{ grid-template-columns:1fr }
    .mockup-dash .safe-card .grid{ grid-template-columns:1fr }
    .mockup-dash .safe-card .cell{ border-right:none; border-bottom:1px solid var(--rule); min-height:auto }
    .mockup-dash .welcome{ padding:48px 0 40px }
    .mockup-dash .sec{ padding:48px 0 }
    .mockup-dash .rep-card .body, .mockup-dash .rep-card .demo{ padding:28px 24px }
    .mockup-dash .found-card .body, .mockup-dash .found-card .feat{ padding:32px 24px }
  }
`;
