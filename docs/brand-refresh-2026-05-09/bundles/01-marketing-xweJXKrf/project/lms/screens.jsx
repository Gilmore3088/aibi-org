/* global React */
// LMS screens — Overview, Module, Activity workspace, Toolbox.

const { PILLARS: P, MODULES: M, ACTIVITIES_M7, SAVED_ARTIFACTS, LIBRARY, MODELS, SAMPLE_TASKS, STATE: S } = window.LMS_DATA;
const { Sidebar, TopBar, PillarTag, ProgressDot, ModelPicker, ModelLogo, PrimaryButton, GhostButton, getModuleStatus } = window;

// ============ OVERVIEW ============
function OverviewScreen({ navigate, progress }){
  const completed = S.completed.length;
  const total = M.length;
  const pct = Math.round(completed / total * 100);
  const totalMin = M.reduce((s,x)=>s+x.mins, 0);
  const currentMod = M.find(x => x.num === S.current);

  return (
    <div>
      <TopBar
        crumbs={['Education', 'AiBI-Practitioner']}
        right={
          <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)' }}>
            {completed}/{total} complete
          </span>
        }
      />

      <div style={{ maxWidth:1080, margin:'0 auto', padding:'40px 36px 80px' }}>
        {/* Hero */}
        <section style={{ marginBottom:56 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
            <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)' }}>Welcome back, {S.learner.name.split(' ')[0]}</span>
            <span style={{ flex:1, height:1, background:'var(--rule)' }} />
          </div>

          <h1 style={{ fontFamily:'var(--serif)', fontWeight:500, fontSize:'clamp(46px, 6vw, 76px)', lineHeight:0.98, letterSpacing:'-0.035em', margin:'0 0 18px' }}>
            Banking AI <em style={{ color:'var(--terra)', fontStyle:'normal', fontWeight:500 }}>Practitioner.</em>
          </h1>
          <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, lineHeight:1.4, color:'var(--ink-2)', whiteSpace:'nowrap', margin:'0 0 12px' }}>
            Learn AI by doing AI — twelve modules, twelve real artifacts.
          </p>
          <p style={{ color:'var(--slate)', fontSize:15, lineHeight:1.6, maxWidth:'62ch', margin:0 }}>
            In less than two weeks, write better, summarize faster, think clearer, and avoid risky AI mistakes — using the model your institution already trusts.
          </p>

          {/* Resume strip */}
          <div style={{
            marginTop:32, display:'grid', gridTemplateColumns:'auto 1fr auto', gap:24, alignItems:'center',
            background:'var(--ink)', color:'var(--paper)', padding:'22px 26px', borderRadius:2,
          }}>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(250,246,237,0.6)' }}>Currently on</span>
              <span style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', color:'var(--terra-light)' }}>Module {String(currentMod.num).padStart(2,'0')} · {currentMod.mins} min</span>
            </div>
            <div>
              <h3 style={{ fontFamily:'var(--serif)', fontWeight:500, fontSize:26, lineHeight:1.1, letterSpacing:'-0.02em', margin:0 }}>
                {currentMod.title}
              </h3>
              <p style={{ margin:'4px 0 0', fontSize:13, color:'rgba(250,246,237,0.72)', lineHeight:1.5, maxWidth:'62ch' }}>{currentMod.goal}</p>
            </div>
            <PrimaryButton
              onClick={()=>navigate({ name:'module', num: currentMod.num })}
              style={{ background:'var(--terra)', color:'var(--paper)' }}>
              Resume <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', textTransform:'none', letterSpacing:0, fontSize:14 }}>→</span>
            </PrimaryButton>
          </div>

          {/* Stats */}
          <div style={{ marginTop:18, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', borderTop:'1px solid var(--rule-strong)', borderBottom:'1px solid var(--rule)' }}>
            {[
              { k:'Progress', v:`${pct}%`, sub:`${completed} of ${total} modules` },
              { k:'Time committed', v:`${totalMin}m`, sub:'across all modules' },
              { k:'Artifacts saved', v:SAVED_ARTIFACTS.length, sub:'in your Toolbox' },
              { k:'Cohort', v:'Self-paced', sub:`${S.learner.institution}` },
            ].map((r,i)=>(
              <div key={i} style={{ padding:'18px 22px', borderRight: i<3 ? '1px solid var(--rule)' : 'none' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--muted)' }}>{r.k}</div>
                <div style={{ fontFamily:'var(--serif)', fontWeight:500, fontSize:30, letterSpacing:'-0.02em', lineHeight:1, marginTop:6 }}>{r.v}</div>
                <div style={{ fontSize:12, color:'var(--slate)', marginTop:4 }}>{r.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* What you'll do (outcomes) */}
        <section style={{ display:'grid', gridTemplateColumns:'1fr 0.85fr', gap:28, marginBottom:64 }}>
          <div style={{ border:'1px solid var(--rule)', padding:26, background:'var(--paper)', borderRadius:3 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)', marginBottom:14 }}>What you will be able to do</div>
            <ul style={{ margin:0, padding:0, listStyle:'none', display:'grid', gap:10 }}>
              {[
                'Choose the right prompt strategy for the job',
                'Write safer, clearer prompts for daily banking work',
                'Summarize banking documents responsibly',
                'Review AI outputs for errors and unsupported claims',
                'Avoid entering sensitive data into public tools',
                'Use AI for communication, meetings, policy review, and productivity',
              ].map(x => (
                <li key={x} style={{ display:'flex', gap:10, fontSize:14, color:'var(--ink-2)', lineHeight:1.5 }}>
                  <span style={{ marginTop:7, width:6, height:6, background:'var(--terra)', flex:'none' }} />
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ border:'1px solid var(--rule)', padding:26, background:'var(--parch)', borderRadius:3 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)', marginBottom:14 }}>Required outputs</div>
            <div style={{ display:'grid', gap:14 }}>
              {[
                { t:'Acceptable Use card', d:'A card you keep at your desk that draws your AI line.' },
                { t:'Three saved prompts', d:'Patterns you reuse weekly without re-typing context.' },
                { t:'A reviewed work product', d:'A real artifact \u2014 email, summary, script \u2014 reviewed by you.' },
                { t:'Final practical assessment', d:'A reviewed work product package that demonstrates safe, practical AI use.' },
              ].map(r => (
                <div key={r.t}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:500, color:'var(--ink)' }}>{r.t}</div>
                  <div style={{ fontSize:12.5, color:'var(--slate)', lineHeight:1.5 }}>{r.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Course structure */}
        <section style={{ background:'var(--parch)', padding:'34px 36px', border:'1px solid var(--rule)', borderRadius:3 }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8 }}>
            <h2 style={{ fontFamily:'var(--serif)', fontWeight:500, fontSize:32, letterSpacing:'-0.02em', margin:0 }}>Course structure</h2>
            <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)' }}>4 pillars · 12 modules</span>
          </div>
          <p style={{ color:'var(--slate)', fontSize:14, maxWidth:'58ch', margin:'0 0 28px' }}>
            Each module is roughly 20–40 minutes of learning, practice, and a single banking artifact you walk away with.
          </p>

          {P.map(pillar => {
            const mods = M.filter(m => m.pillar === pillar.id);
            return (
              <div key={pillar.id} style={{ marginBottom:32 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14, paddingBottom:8, borderBottom:'1px solid var(--rule)' }}>
                  <PillarTag pillarId={pillar.id} size="lg" />
                  <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)' }}>{mods.length} modules · {mods.reduce((a,b)=>a+b.mins,0)} min</span>
                </div>
                <div style={{ display:'grid', gap:10 }}>
                  {mods.map(mod => {
                    const status = getModuleStatus(mod.num, S.completed, S.current);
                    const locked = status === 'locked';
                    return (
                      <button key={mod.num}
                        disabled={locked}
                        onClick={()=>!locked && navigate({ name:'module', num:mod.num })}
                        style={{
                          textAlign:'left', cursor: locked ? 'not-allowed' : 'pointer',
                          background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3,
                          padding:'18px 22px',
                          display:'grid', gridTemplateColumns:'24px 56px 1fr auto auto', gap:18, alignItems:'center',
                          opacity: locked ? 0.55 : 1,
                          transition:'border-color .15s, background .15s',
                        }}
                        onMouseEnter={e => { if(!locked) e.currentTarget.style.borderColor='var(--terra)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--rule)'; }}
                      >
                        <ProgressDot status={status} size={11} />
                        <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)', letterSpacing:'0.06em' }}>M{String(mod.num).padStart(2,'0')}</span>
                        <div>
                          <div style={{ fontFamily:'var(--serif)', fontSize:19, fontWeight:500, letterSpacing:'-0.01em', color: status==='current' ? 'var(--terra)' : 'var(--ink)' }}>
                            {mod.title}
                          </div>
                          <div style={{ fontSize:13, color:'var(--slate)', marginTop:3, lineHeight:1.5 }}>{mod.output}</div>
                        </div>
                        <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted)' }}>{mod.mins} min</span>
                        <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, color: locked ? 'var(--rule-strong)' : 'var(--ink)' }}>{locked ? '·' : '→'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

// ============ MODULE PAGE ============
function ModuleScreen({ num, navigate, layout, setLayout, progress, defaultLayout, hasOverride, clearOverride }){
  const mod = M.find(x => x.num === num);
  if(!mod) return <div style={{ padding:40 }}>Module not found.</div>;

  const status = getModuleStatus(mod.num, S.completed, S.current);
  const [model, setModel] = useState('claude');
  const [stepIdx, setStepIdx] = useState(0);

  // Module 7 has activities; others get a placeholder
  const activities = mod.num === 7 ? ACTIVITIES_M7 : [];

  const lessonSections = [
    { id:'l1', title:'Why this matters', body:'Reusable prompts are the difference between a one-off chat and a working tool. The bankers who pull ahead this year are the ones who write a prompt once and use it 50 times — not the ones who reinvent the same chat every Tuesday.' },
    { id:'l2', title:'The four-pillar prompt', body:'Every prompt worth saving has four parts: a Role for the AI, the Inputs you will paste, the Constraints (what to avoid), and the Output you want back. Skip any one of them and you get a chat. Keep all four and you have a tool.' },
    { id:'l3', title:'A real example', body:'A member-services rep needs to rewrite a rate-change letter. Compare two prompts side by side: one is a chat (“rewrite this nicer”), the other is a tool (Role: a member-services editor; Inputs: the original letter; Constraints: no jargon, no implied promises about future rates; Output: a 120-word rewrite with one clear ask).' },
    { id:'l4', title:'When NOT to save it', body:'If a prompt depends on facts that change weekly, don\u2019t save it as a template. Save the *pattern* instead — and re-paste the facts each time.' },
  ];

  return (
    <div>
      <TopBar
        crumbs={['Course', `Module ${String(mod.num).padStart(2,'0')}`]}
        right={
          <button onClick={()=>navigate({ name:'overview' })} style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', background:'transparent', border:'none', cursor:'pointer' }}>← Course overview</button>
        }
      />

      {/* Module header */}
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'36px 36px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:18 }}>
          <PillarTag pillarId={mod.pillar} />
          <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)' }}>Module {String(mod.num).padStart(2,'0')} · {mod.mins} min</span>
          <span style={{ flex:1, height:1, background:'var(--rule)' }} />
          <ProgressDot status={status} />
          <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color: status==='current'?'var(--terra)':'var(--muted)' }}>
            {status === 'current' ? 'In progress' : status === 'completed' ? 'Completed' : 'Locked'}
          </span>
        </div>

        <h1 style={{ fontFamily:'var(--serif)', fontWeight:500, fontSize:'clamp(38px, 5vw, 58px)', lineHeight:1.05, letterSpacing:'-0.025em', margin:'0 0 12px' }}>
          {mod.title.split(' — ')[0]}
          {mod.title.includes(' — ') && <em style={{ color:'var(--terra)', fontStyle:'italic', fontWeight:400 }}> — {mod.title.split(' — ')[1]}</em>}
        </h1>
        <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:19, lineHeight:1.45, color:'var(--ink-2)', margin:'0 0 4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{mod.goal}</p>
        <p style={{ color:'var(--slate)', fontSize:13, fontFamily:'var(--mono)', letterSpacing:'0.04em', marginTop:14 }}>
          You walk away with: <span style={{ color:'var(--ink)', fontWeight:600 }}>{mod.output}</span>
        </p>

        {/* Inline per-module layout switcher */}
        <div style={{ marginTop:22, display:'flex', alignItems:'center', flexWrap:'wrap', gap:14, paddingTop:14, borderTop:'1px solid var(--rule)' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--muted)' }}>This page · layout</span>
          {[{v:'split',l:'Split'},{v:'stepped',l:'Stepped'},{v:'longform',l:'Long-form'}].map(o => (
            <button key={o.v} onClick={()=>setLayout && setLayout(o.v)}
              style={{
                background: o.v===layout ? 'var(--ink)' : 'transparent',
                color: o.v===layout ? 'var(--paper)' : 'var(--ink-2)',
                border:'1px solid '+ (o.v===layout ? 'var(--ink)' : 'var(--rule-strong)'),
                padding:'5px 12px', borderRadius:2, cursor:'pointer',
                fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:600,
              }}>{o.l}</button>
          ))}
          {hasOverride && (
            <button onClick={clearOverride}
              style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--terra)' }}>
              Reset to default ({defaultLayout})
            </button>
          )}
          <span style={{ flex:1 }} />
          <span style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)' }}>
            Each module remembers its own layout
          </span>
        </div>
      </div>

      {/* Layout-driven body */}
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'12px 36px 80px' }}>
        {layout === 'split' && <ModuleSplit mod={mod} sections={lessonSections} activities={activities} model={model} setModel={setModel} navigate={navigate} progress={progress} />}
        {layout === 'stepped' && <ModuleStepped mod={mod} sections={lessonSections} activities={activities} model={model} setModel={setModel} stepIdx={stepIdx} setStepIdx={setStepIdx} navigate={navigate} progress={progress} />}
        {layout === 'longform' && <ModuleLongform mod={mod} sections={lessonSections} activities={activities} model={model} setModel={setModel} navigate={navigate} progress={progress} />}

        {layout !== 'stepped' && <ModuleFooter mod={mod} navigate={navigate} />}
      </div>
    </div>
  );
}

function ModuleFooter({ mod, navigate }){
  const next = M.find(x => x.num === mod.num + 1);
  return (
    <div style={{ marginTop:32, paddingTop:22, borderTop:'1px solid var(--rule-strong)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:18 }}>
      <button onClick={()=>navigate({ name:'overview' })}
        style={{ background:'transparent', border:'none', cursor:'pointer', padding:0, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)' }}>
        ← Course overview
      </button>
      <PrimaryButton
        onClick={()=>next ? navigate({ name:'module', num:next.num }) : navigate({ name:'complete' })}
        style={{ background:'var(--terra)', color:'var(--paper)' }}>
        {next
          ? <>Mark complete · continue to M{String(next.num).padStart(2,'0')}</>
          : <>Finish course · view recap</>}
        <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', textTransform:'none', letterSpacing:0, fontSize:14 }}>→</span>
      </PrimaryButton>
    </div>
  );
}

// --- Layout: Split (lesson left, activity workspace right) ---
function ModuleSplit({ mod, sections, activities, model, setModel, navigate, progress }){
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28 }}>
      <div>
        <SectionLabel>Lesson</SectionLabel>
        <div style={{ background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3, padding:'28px 30px' }}>
          {sections.map(sec => (
            <div key={sec.id} style={{ marginBottom:22 }}>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:500, letterSpacing:'-0.015em', margin:'0 0 8px' }}>{sec.title}</h3>
              <p style={{ margin:0, fontSize:14.5, lineHeight:1.65, color:'var(--ink-2)' }}>{sec.body}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Workspace</SectionLabel>
        <ActivityWorkspace mod={mod} activity={activities[0]} model={model} setModel={setModel} navigate={navigate} progress={progress} />
      </div>
    </div>
  );
}

// --- Layout: Stepped (one section at a time, wizard) ---
function ModuleStepped({ mod, sections, activities, model, setModel, stepIdx, setStepIdx, navigate, progress }){
  const allSteps = [...sections.map(s => ({ kind:'lesson', ...s })), ...activities.map(a => ({ kind:'activity', ...a }))];
  const step = allSteps[stepIdx] || allSteps[0];
  const isActivity = step.kind === 'activity';

  return (
    <div>
      {/* Stepper */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${allSteps.length}, 1fr)`, gap:6, marginBottom:28 }}>
        {allSteps.map((s, i) => {
          const done = i < stepIdx;
          const here = i === stepIdx;
          return (
            <button key={i} onClick={()=>setStepIdx(i)}
              style={{
                background:'transparent', border:'none', textAlign:'left', cursor:'pointer',
                paddingTop:10, borderTop: `3px solid ${ done ? 'var(--sage)' : here ? 'var(--terra)' : 'var(--rule)' }`,
              }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color: here ? 'var(--terra)' : 'var(--muted)' }}>
                Step {String(i+1).padStart(2,'0')}{s.kind==='activity' ? ' · Activity' : ''}
              </div>
              <div style={{ fontFamily:'var(--serif)', fontSize:14, fontWeight: here?600:400, color: here ? 'var(--ink)' : 'var(--ink-2)', marginTop:3, lineHeight:1.2 }}>{s.title}</div>
            </button>
          );
        })}
      </div>

      {/* Step body */}
      <div style={{ background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3, padding:'40px 44px', minHeight:380 }}>
        {!isActivity ? (
          <div style={{ maxWidth:'62ch' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:34, fontWeight:500, letterSpacing:'-0.02em', margin:'0 0 14px' }}>{step.title}</h2>
            <p style={{ fontSize:16, lineHeight:1.7, color:'var(--ink-2)', margin:0 }}>{step.body}</p>
          </div>
        ) : (
          <ActivityWorkspace mod={mod} activity={step} model={model} setModel={setModel} navigate={navigate} progress={progress} embedded />
        )}
      </div>

      {/* Step controls */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:18 }}>
        <GhostButton onClick={()=>setStepIdx(i=>Math.max(0, i-1))} disabled={stepIdx===0} style={{ opacity: stepIdx===0?0.4:1 }}>
          ← Previous
        </GhostButton>
        {stepIdx < allSteps.length - 1 ? (
          <PrimaryButton onClick={()=>setStepIdx(i=>i+1)}>
            Next step <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', textTransform:'none', letterSpacing:0, fontSize:14 }}>→</span>
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={()=>navigate({ name:'overview' })}>
            Complete module <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', textTransform:'none', letterSpacing:0, fontSize:14 }}>→</span>
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

// --- Layout: Long-form (single column, activity at bottom) ---
function ModuleLongform({ mod, sections, activities, model, setModel, navigate, progress }){
  return (
    <div style={{ maxWidth:760, margin:'0 auto' }}>
      <div style={{ background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3, padding:'44px 50px' }}>
        {sections.map(sec => (
          <section key={sec.id} style={{ marginBottom:34 }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:28, fontWeight:500, letterSpacing:'-0.02em', margin:'0 0 12px' }}>{sec.title}</h2>
            <p style={{ margin:0, fontSize:16, lineHeight:1.75, color:'var(--ink-2)' }}>{sec.body}</p>
          </section>
        ))}
      </div>
      <div style={{ marginTop:28 }}>
        <SectionLabel>Activity</SectionLabel>
        <ActivityWorkspace mod={mod} activity={activities[0]} model={model} setModel={setModel} navigate={navigate} progress={progress} />
      </div>
    </div>
  );
}

// --- Section label ---
function SectionLabel({ children }){
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
      <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)' }}>{children}</span>
      <span style={{ flex:1, height:1, background:'var(--rule)' }} />
    </div>
  );
}

// ============ ACTIVITY WORKSPACE ============
function ActivityWorkspace({ mod, activity, model, setModel, navigate, progress, embedded=false }){
  const [task, setTask] = useState(SAMPLE_TASKS[0].task);
  const [audience, setAudience] = useState('Members opening their first checking account.');
  const [inputText, setInputText] = useState('Dear Member,\n\nEffective July 1, the rate on your savings account will adjust from 0.85% APY to 1.10% APY...');
  const [constraints, setConstraints] = useState('Plain language. No jargon. No implied promises about future rates.');
  const [outputShape, setOutputShape] = useState('A 120-word rewrite with one clear ask at the end.');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [savedToToolbox, setSavedToToolbox] = useState(false);

  if(!activity){
    return (
      <div style={{ background:'var(--paper)', border:'1px dashed var(--rule-strong)', borderRadius:3 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:'1px dashed var(--rule-strong)', background:'var(--parch)' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)' }}>Activity · placeholder</span>
          <span style={{ flex:1 }} />
          <ModelPicker value={model} onChange={setModel} compact />
        </div>
        <div style={{ padding:'30px 26px', textAlign:'center' }}>
          <p style={{ margin:'0 0 14px', color:'var(--slate)', fontSize:14, lineHeight:1.55 }}>The full activity workspace lives here, with model picker, prompt scaffold, and Save to Toolbox. Module 07 is wired up as the live demo.</p>
          <GhostButton onClick={()=>navigate({ name:'module', num:7 })}>Try the live activity in module 07</GhostButton>
        </div>
      </div>
    );
  }

  function run(){
    setRunning(true); setResult(null);
    setTimeout(()=>{
      setRunning(false);
      const m = MODELS.find(x => x.id === model);
      setResult({
        model: m,
        text: `Hi there,\n\nStarting July 1, the rate on your savings account will move from 0.85% APY to 1.10% APY \u2014 a small step up that adds about $${(Math.random()*40+10).toFixed(0)} a year on every $5,000 you keep with us.\n\nNo action is needed on your part. If you have questions, reply to this email or stop by any branch.\n\nWith you,\n${S.learner.institution}`,
        notes: 'No promises about future rates. No jargon. ~115 words.',
      });
    }, 800);
  }

  function save(){
    setSavedToToolbox(true);
    setTimeout(()=>setSavedToToolbox(false), 2400);
  }

  return (
    <div style={{ background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3, overflow:'hidden' }}>
      {/* Workspace bar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:'1px solid var(--rule)', background:'var(--parch)' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--terra)' }}>Activity {activity.id}</span>
        <span style={{ fontFamily:'var(--serif)', fontSize:14, color:'var(--ink)', fontWeight:500 }}>{activity.title}</span>
        <span style={{ flex:1 }} />
        <ModelPicker value={model} onChange={setModel} compact />
      </div>

      <div style={{ padding:'20px 22px 18px' }}>
        <p style={{ margin:'0 0 16px', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, color:'var(--ink-2)', lineHeight:1.5 }}>{activity.lead}</p>

        {/* Sample task starter chips */}
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:6, marginBottom:18 }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', marginRight:4 }}>Or pick a starter:</span>
          {SAMPLE_TASKS.map(s => (
            <button key={s.task} onClick={()=>setTask(s.task)}
              style={{
                background:'transparent', border:'1px solid var(--rule-strong)', borderRadius:2,
                padding:'4px 9px', cursor:'pointer',
                fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.04em', color:'var(--slate)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--terra)'; e.currentTarget.style.color='var(--terra)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--rule-strong)'; e.currentTarget.style.color='var(--slate)'; }}
            >
              {s.role}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display:'grid', gap:14 }}>
          <FormField label="Role / task" value={task} onChange={setTask} />
          <FormField label="Audience" value={audience} onChange={setAudience} />
          <FormField label="Inputs (paste your raw material)" value={inputText} onChange={setInputText} multi />
          <FormField label="Constraints (what to avoid)" value={constraints} onChange={setConstraints} />
          <FormField label="Output shape (what you want back)" value={outputShape} onChange={setOutputShape} />
        </div>

        {/* Action row */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:18 }}>
          <PrimaryButton onClick={run} style={{ background: running ? 'var(--terra-light)' : 'var(--terra)', color:'var(--paper)' }}>
            {running ? 'Running…' : <>Run on <ModelLogo id={model} size={16} /> {MODELS.find(x=>x.id===model).name}</>}
          </PrimaryButton>
          <span style={{ flex:1 }} />
          <GhostButton onClick={save}>{savedToToolbox ? '✓ Saved to Toolbox' : 'Save to Toolbox'}</GhostButton>
        </div>

        {/* Result */}
        {result && (
          <div style={{ marginTop:22, border:'1px solid var(--rule-strong)', borderRadius:3, overflow:'hidden' }}>
            <div style={{ background:'var(--ink)', color:'var(--paper)', padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
              <ModelLogo id={result.model.id} size={18} />
              <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase' }}>{result.model.name} output</span>
              <span style={{ flex:1 }} />
              <span style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.16em', color:'rgba(250,246,237,0.6)' }}>v1 · {new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <pre style={{ margin:0, padding:'18px 20px', fontFamily:'var(--serif)', fontSize:15, lineHeight:1.6, whiteSpace:'pre-wrap', color:'var(--ink)', background:'var(--paper)' }}>{result.text}</pre>
            <div style={{ borderTop:'1px solid var(--rule)', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, background:'var(--parch)' }}>
              <span style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)' }}>Reviewer note</span>
              <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13.5, color:'var(--ink-2)' }}>{result.notes}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, multi=false }){
  const Tag = multi ? 'textarea' : 'input';
  return (
    <label style={{ display:'block' }}>
      <span style={{ display:'block', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:5 }}>{label}</span>
      <Tag value={value} onChange={e => onChange(e.target.value)}
        rows={multi ? 4 : undefined}
        style={{
          width:'100%', padding:'10px 12px', borderRadius:2,
          border:'1px solid var(--rule-strong)', background:'var(--linen)',
          fontFamily: multi ? 'var(--mono)' : 'var(--sans)',
          fontSize: multi ? 12.5 : 13.5,
          color:'var(--ink)', resize:'vertical',
        }}
      />
    </label>
  );
}

// ============ TOOLBOX ============
function ToolboxScreen({ navigate }){
  const [tab, setTab] = useState('artifacts');

  return (
    <div>
      <TopBar
        crumbs={['Course', 'Your Toolbox']}
        right={<span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)' }}>{SAVED_ARTIFACTS.length} artifacts · {LIBRARY.length} references</span>}
      />
      <div style={{ maxWidth:1080, margin:'0 auto', padding:'40px 36px 80px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:16, marginBottom:8 }}>
          <h1 style={{ fontFamily:'var(--serif)', fontWeight:500, fontSize:54, letterSpacing:'-0.03em', lineHeight:1, margin:0 }}>
            Your <em style={{ color:'var(--terra)', fontStyle:'italic', fontWeight:400 }}>Toolbox.</em>
          </h1>
          <span style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)' }}>{SAVED_ARTIFACTS.length} saved · {LIBRARY.length} references</span>
        </div>
        <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, color:'var(--ink-2)', whiteSpace:'nowrap', margin:'0 0 28px' }}>
          What you build, and what we hand you — kept where you'll find it.
        </p>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--rule-strong)', marginBottom:24 }}>
          {[
            { id:'artifacts', label:'Your artifacts', count:SAVED_ARTIFACTS.length },
            { id:'library',   label:'Reference library', count:LIBRARY.length },
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{
                background:'transparent', border:'none', cursor:'pointer',
                padding:'12px 18px', marginBottom:-1,
                fontFamily:'var(--sans)', fontSize:13.5, fontWeight:600,
                color: tab===t.id ? 'var(--terra)' : 'var(--slate)',
                borderBottom: tab===t.id ? '2px solid var(--terra)' : '2px solid transparent',
              }}>
              {t.label} <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', marginLeft:4 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {tab === 'artifacts' && <ArtifactsTable navigate={navigate} />}

        {tab === 'library' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
            {LIBRARY.map(it => (
              <div key={it.id} style={{ background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3, padding:'20px 22px' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)', marginBottom:8 }}>{it.kind}</div>
                <h3 style={{ fontFamily:'var(--serif)', fontSize:21, fontWeight:500, letterSpacing:'-0.015em', margin:'0 0 8px' }}>{it.title}</h3>
                <p style={{ margin:0, fontSize:13.5, color:'var(--slate)', lineHeight:1.55 }}>{it.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArtifactsTable({ navigate }){
  const [openId, setOpenId] = useState(null);
  return (
    <div style={{ border:'1px solid var(--rule)', borderRadius:3, overflow:'hidden', background:'var(--paper)' }}>
      <div style={{ display:'grid', gridTemplateColumns:'24px 2.2fr 1fr 80px 1fr 70px 110px', gap:14, padding:'10px 18px', borderBottom:'1px solid var(--rule)', background:'var(--parch)', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--muted)' }}>
        <span></span><span>Artifact</span><span>Kind</span><span>Module</span><span>Updated</span><span>Model</span><span style={{ textAlign:'right' }}>Versions</span>
      </div>
      {SAVED_ARTIFACTS.map(a => {
        const open = openId === a.id;
        return (
          <div key={a.id} style={{ borderBottom:'1px solid var(--rule)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'24px 2.2fr 1fr 80px 1fr 70px 110px', gap:14, padding:'14px 18px', alignItems:'center' }}>
              <button onClick={()=>setOpenId(open ? null : a.id)} title={open ? 'Hide history' : 'Show history'}
                style={{ background:'transparent', border:'1px solid var(--rule-strong)', width:22, height:22, borderRadius:2, cursor:'pointer', display:'grid', placeItems:'center', color:'var(--ink-2)', fontFamily:'var(--mono)', fontSize:11, lineHeight:1 }}>
                {open ? '–' : '+'}
              </button>
              <span style={{ display:'flex', alignItems:'baseline', gap:8, minWidth:0 }}>
                <span style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:500, color:'var(--ink)' }}>{a.title}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.06em', padding:'2px 6px', border:'1px solid var(--terra)', color:'var(--terra)', borderRadius:2, fontWeight:600 }}>v{a.currentVersion}</span>
              </span>
              <span style={{ fontFamily:'var(--sans)', fontSize:12.5, color:'var(--slate)' }}>{a.kind}</span>
              <button onClick={()=>navigate({ name:'module', num:a.moduleNum })} style={{ background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'var(--mono)', fontSize:11, color:'var(--terra)', padding:0 }}>
                M{String(a.moduleNum).padStart(2,'0')} →
              </button>
              <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>{a.updatedAt}</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:'var(--mono)', fontSize:10.5, color:'var(--ink-2)' }}>
                {a.model === '\u2014' ? <span style={{ color:'var(--rule-strong)' }}>—</span> : <><ModelLogo id={a.model.toLowerCase()} size={16} />{a.model}</>}
              </span>
              <span style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted)' }}>
                {a.versions.length} {a.versions.length === 1 ? 'version' : 'versions'}
              </span>
            </div>

            {open && (
              <div style={{ background:'var(--linen)', borderTop:'1px solid var(--rule)', padding:'14px 18px 18px 60px' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)', marginBottom:10 }}>Version history</div>
                <ol style={{ listStyle:'none', margin:0, padding:0, position:'relative' }}>
                  {/* timeline rail */}
                  <span style={{ position:'absolute', left:5, top:6, bottom:6, width:1, background:'var(--rule)' }} />
                  {a.versions.map((v, i) => {
                    const isCurrent = v.v === a.currentVersion;
                    return (
                      <li key={v.v} style={{ display:'grid', gridTemplateColumns:'14px 80px 1fr 110px 80px', gap:14, alignItems:'center', padding:'7px 0', position:'relative' }}>
                        <span style={{ width:11, height:11, borderRadius:'50%', background: isCurrent ? 'var(--terra)' : 'var(--paper)', border: isCurrent ? '0' : '1.5px solid var(--rule-strong)', boxShadow: isCurrent ? '0 0 0 4px var(--terra-soft)' : 'none', position:'relative', zIndex:1 }} />
                        <span style={{ fontFamily:'var(--mono)', fontSize:11.5, fontWeight:600, color: isCurrent ? 'var(--terra)' : 'var(--ink-2)', letterSpacing:'0.04em' }}>v{v.v}{isCurrent && ' · current'}</span>
                        <span style={{ fontFamily:'var(--serif)', fontSize:14, color:'var(--ink-2)', lineHeight:1.4 }}>{v.note}</span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:10.5, color:'var(--muted)' }}>{v.when}</span>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:'var(--mono)', fontSize:10, color:'var(--slate)' }}>
                          {v.model === '\u2014' ? '—' : <><ModelLogo id={v.model.toLowerCase()} size={14} />{v.model}</>}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <div style={{ marginTop:14, display:'flex', gap:10 }}>
                  <GhostButton onClick={()=>navigate({ name:'module', num:a.moduleNum })}>Open in module {String(a.moduleNum).padStart(2,'0')}</GhostButton>
                  <GhostButton onClick={()=>{}}>Compare versions</GhostButton>
                  <GhostButton onClick={()=>{}}>Restore an earlier version</GhostButton>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CompleteScreen({ navigate }){
  const totalMin = M.reduce((s,x)=>s+x.mins, 0);
  const tokens = '184,210';
  const reviews = SAVED_ARTIFACTS.reduce((s,a)=>s+a.versions.length, 0);
  return (
    <div>
      <TopBar crumbs={['Course', 'Complete']} right={<span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--terra)' }}>★ Practitioner — earned</span>} />
      <div style={{ maxWidth:1080, margin:'0 auto', padding:'48px 36px 80px' }}>

        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)' }}>Course complete · {S.learner.institution}</span>
          <span style={{ flex:1, height:1, background:'var(--rule)' }} />
          <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--muted)' }}>{new Date().toLocaleDateString(undefined,{month:'long', day:'numeric', year:'numeric'})}</span>
        </div>

        <h1 style={{ fontFamily:'var(--serif)', fontWeight:500, fontSize:'clamp(56px, 7vw, 96px)', lineHeight:0.95, letterSpacing:'-0.04em', margin:'0 0 18px' }}>
          You\u2019re a <em style={{ color:'var(--terra)', fontStyle:'italic', fontWeight:400 }}>Practitioner.</em>
        </h1>
        <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, lineHeight:1.4, color:'var(--ink-2)', whiteSpace:'nowrap', margin:'0 0 36px' }}>
          {S.learner.name.split(' ')[0]}, twelve modules done. Twelve artifacts in hand.
        </p>

        {/* Big stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', border:'1px solid var(--rule-strong)', borderRadius:3, overflow:'hidden', marginBottom:36 }}>
          {[
            { k:'Modules complete', v:'12 / 12', sub:'4 pillars covered' },
            { k:'Time invested',    v:`${totalMin}m`, sub:`${(totalMin/60).toFixed(1)} focused hours` },
            { k:'Tokens used',      v:tokens, sub:'across Claude · OpenAI · Gemini' },
            { k:'Reviews logged',   v:reviews, sub:`${SAVED_ARTIFACTS.length} artifacts in Toolbox` },
          ].map((r,i)=>(
            <div key={i} style={{ padding:'22px 24px', borderRight: i<3 ? '1px solid var(--rule)' : 'none', background: i%2 ? 'var(--paper)' : 'var(--linen)' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--muted)' }}>{r.k}</div>
              <div style={{ fontFamily:'var(--serif)', fontWeight:500, fontSize:38, letterSpacing:'-0.02em', lineHeight:1, marginTop:6 }}>{r.v}</div>
              <div style={{ fontSize:12.5, color:'var(--slate)', marginTop:4 }}>{r.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:24, marginBottom:36 }}>
          {/* Toolbox recap */}
          <div style={{ background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3, padding:26 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)', marginBottom:12 }}>What you walked away with</div>
            <div style={{ display:'grid', gap:10 }}>
              {SAVED_ARTIFACTS.map(a => (
                <div key={a.id} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:14, alignItems:'baseline', paddingBottom:8, borderBottom:'1px solid var(--rule)' }}>
                  <span style={{ fontFamily:'var(--serif)', fontSize:17, fontWeight:500, color:'var(--ink)' }}>{a.title}</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.06em', color:'var(--terra)', fontWeight:600 }}>v{a.currentVersion}</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)' }}>M{String(a.moduleNum).padStart(2,'0')}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:18 }}>
              <GhostButton onClick={()=>navigate({ name:'toolbox' })}>Open my Toolbox</GhostButton>
            </div>
          </div>

          {/* Model usage */}
          <div style={{ background:'var(--ink)', color:'var(--paper)', border:'1px solid var(--ink)', borderRadius:3, padding:26 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra-light)', marginBottom:14 }}>Model usage</div>
            {[
              { id:'claude', name:'Claude', pct:58, runs:42 },
              { id:'openai', name:'OpenAI', pct:27, runs:19 },
              { id:'gemini', name:'Gemini', pct:15, runs:11 },
            ].map(m => (
              <div key={m.id} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <ModelLogo id={m.id} size={18} />
                  <span style={{ fontFamily:'var(--sans)', fontSize:13, fontWeight:600 }}>{m.name}</span>
                  <span style={{ flex:1 }} />
                  <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'rgba(250,246,237,0.6)' }}>{m.runs} runs · {m.pct}%</span>
                </div>
                <div style={{ height:4, background:'rgba(250,246,237,0.12)', borderRadius:1 }}>
                  <div style={{ width:`${m.pct}%`, height:'100%', background:'var(--terra)', borderRadius:1 }} />
                </div>
              </div>
            ))}
            <p style={{ marginTop:14, fontSize:12.5, lineHeight:1.55, color:'rgba(250,246,237,0.72)' }}>You compared multiple models on 6 of 12 activities — a key Practitioner habit.</p>
          </div>
        </div>

        {/* Next steps */}
        <div style={{ background:'var(--parch)', border:'1px solid var(--rule)', borderRadius:3, padding:'28px 30px', marginBottom:32 }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)', marginBottom:14 }}>What\u2019s next</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18 }}>
            {[
              { t:'AiBI-Builder', d:'The next track. Build internal tools your team will actually use.', cta:'Join the waitlist' },
              { t:'Cohort live sessions', d:'Quarterly Q&A with banking AI practitioners across the network.', cta:'See schedule' },
              { t:'Coach a coworker', d:'Run the Practitioner course with one teammate. Free re-enrollment for them.', cta:'Send invite' },
            ].map(s => (
              <div key={s.t} style={{ background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3, padding:'18px 20px' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:500, letterSpacing:'-0.015em', marginBottom:6 }}>{s.t}</div>
                <p style={{ margin:'0 0 12px', fontSize:13, color:'var(--slate)', lineHeight:1.55 }}>{s.d}</p>
                <span style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--terra)', fontWeight:600 }}>{s.cta} →</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share + download */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32 }}>
          <div style={{ background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3, padding:'24px 26px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)', marginBottom:12 }}>Share the badge</div>
            <p style={{ margin:'0 0 16px', fontSize:13.5, color:'var(--ink-2)', lineHeight:1.55 }}>Tell your network you\u2019re an AiBI-Practitioner. We\u2019ll generate a shareable image and a pre-written post.</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['LinkedIn','X','Email','Copy link'].map(p => (
                <button key={p} style={{ background:'transparent', border:'1px solid var(--rule-strong)', padding:'8px 14px', borderRadius:2, cursor:'pointer', fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:600, color:'var(--ink-2)' }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3, padding:'24px 26px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)', marginBottom:12 }}>Take it with you</div>
            <p style={{ margin:'0 0 16px', fontSize:13.5, color:'var(--ink-2)', lineHeight:1.55 }}>A printable PDF: certificate, your Toolbox, prompts, and reviewer checklists \u2014 ready for your file or your manager.</p>
            <div style={{ display:'flex', gap:10 }}>
              <PrimaryButton onClick={()=>{}} style={{ background:'var(--ink)', color:'var(--paper)' }}>
                Download certificate (PDF)
              </PrimaryButton>
              <GhostButton onClick={()=>{}}>Email it to me</GhostButton>
            </div>
          </div>
        </div>

        {/* Final action */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:24, borderTop:'1px solid var(--rule-strong)' }}>
          <button onClick={()=>navigate({ name:'overview' })} style={{ background:'transparent', border:'none', cursor:'pointer', padding:0, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)' }}>← Back to course overview</button>
          <PrimaryButton onClick={()=>navigate({ name:'toolbox' })} style={{ background:'var(--terra)', color:'var(--paper)' }}>Continue to my Toolbox →</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OverviewScreen, ModuleScreen, ToolboxScreen, CompleteScreen });