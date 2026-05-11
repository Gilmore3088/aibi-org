/* global React */
// Shared LMS components — Sidebar, TopBar, ProgressDot, ModelPicker, ArtifactCard, etc.

const { useState, useMemo, useEffect, useRef } = React;
const { PILLARS, MODULES, MODELS, STATE } = window.LMS_DATA;

// ---------- Status helpers ----------
function getModuleStatus(num, completed, current){
  if (completed.includes(num)) return 'completed';
  if (num === current) return 'current';
  if (num < current) return 'completed';
  return 'locked';
}

// ---------- Brand mark ----------
const sidebarStyles = {
  shell: { background:'var(--paper)', borderRight:'1px solid var(--rule)', minHeight:'100vh', position:'sticky', top:0, alignSelf:'start', display:'flex', flexDirection:'column' },
  brand: { padding:'24px 22px 20px', borderBottom:'1px solid var(--rule)' },
  brandLine1: { fontFamily:'var(--sans)', fontWeight:700, fontSize:20, letterSpacing:'-0.005em', textTransform:'uppercase', lineHeight:1, color:'var(--ink)' },
  brandLine2: { fontFamily:'var(--sans)', fontWeight:700, fontSize:20, letterSpacing:'-0.005em', textTransform:'uppercase', lineHeight:1, color:'var(--slate)', marginTop:2 },
};

function BrandLockup(){
  // Wordmark verbatim from AI Readiness Brief: bold sans uppercase, two lines, ink + slate-blue.
  return (
    <div style={sidebarStyles.brand}>
      <div style={sidebarStyles.brandLine1}>The AI Banking</div>
      <div style={sidebarStyles.brandLine2}>Institute</div>
    </div>
  );
}

// ---------- Progress dot ----------
function ProgressDot({ status, size=10 }){
  const common = { width:size, height:size, borderRadius:'50%', display:'inline-block', flex:'none' };
  if (status === 'completed') return <span style={{ ...common, background:'var(--sage)' }} aria-label="Complete" />;
  if (status === 'current')   return <span style={{ ...common, background:'var(--terra)', boxShadow:'0 0 0 4px var(--terra-soft)' }} aria-label="Current" />;
  return <span style={{ ...common, border:'1.5px solid var(--rule-strong)', background:'transparent' }} aria-label="Locked" />;
}

// ---------- Sidebar ----------
function Sidebar({ route, navigate, density }){
  const compact = density === 'compact';
  const itemPad = compact ? '6px 14px' : '9px 16px';
  const sectionPad = compact ? '12px 22px 6px' : '18px 22px 10px';

  const sections = [
    { id: 'overview', label: 'Course overview', match: r => r.name === 'overview' },
    { id: 'toolbox',  label: 'Your Toolbox',    match: r => r.name === 'toolbox' },
  ];

  return (
    <aside className="sidebar" style={sidebarStyles.shell}>
      <BrandLockup />

      <nav style={{ padding:'14px 0 8px' }}>
        {sections.map(s => {
          const active = s.match(route);
          return (
            <button key={s.id}
              onClick={()=>navigate({ name:s.id })}
              style={{
                display:'flex', alignItems:'center', gap:10, width:'100%',
                background: active ? 'var(--terra-soft)' : 'transparent',
                border:'none', textAlign:'left', cursor:'pointer',
                padding:itemPad, color: active ? 'var(--terra)' : 'var(--ink)',
                fontFamily:'var(--sans)', fontSize:13, fontWeight: active ? 600 : 500,
                borderLeft: active ? '2px solid var(--terra)' : '2px solid transparent',
              }}>
              {s.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop:'1px solid var(--rule)', marginTop:6 }} />

      {/* Pillars + modules */}
      <div style={{ padding:'10px 0 24px', overflowY:'auto', flex:1 }}>
        <div style={{ padding:sectionPad, fontFamily:'var(--sans)', fontWeight:700, fontSize:11, letterSpacing:'-0.005em', textTransform:'uppercase', color:'var(--slate)', lineHeight:1 }}>
          <span style={{ color:'var(--ink)' }}>AiBI</span> Foundation
        </div>
        {PILLARS.map(p => {
          const mods = MODULES.filter(m => m.pillar === p.id);
          return (
            <div key={p.id} style={{ marginBottom: compact ? 8 : 14 }}>
              <div style={{ padding:'6px 22px 4px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:7, height:7, borderRadius:1, background:p.color, display:'inline-block' }} />
                <span style={{ fontFamily:'var(--sans)', fontWeight:700, fontSize:11, letterSpacing:'-0.005em', textTransform:'uppercase', color:'var(--ink)', lineHeight:1 }}>{p.label}</span>
              </div>
              <ul style={{ listStyle:'none', margin:0, padding:0 }}>
                {mods.map(m => {
                  const status = getModuleStatus(m.num, STATE.completed, STATE.current);
                  const active = route.name === 'module' && route.num === m.num;
                  const locked = status === 'locked';
                  return (
                    <li key={m.num}>
                      <button
                        disabled={locked}
                        onClick={() => !locked && navigate({ name:'module', num:m.num })}
                        title={m.title}
                        style={{
                          display:'grid', gridTemplateColumns:'14px 1fr auto', gap:10, alignItems:'center', width:'100%',
                          background: active ? 'var(--terra-soft)' : 'transparent',
                          border:'none', textAlign:'left', cursor: locked ? 'not-allowed' : 'pointer',
                          padding: compact ? '5px 22px 5px 22px' : '7px 22px 7px 22px',
                          color: locked ? 'rgba(27,24,20,0.35)' : (active ? 'var(--terra)' : 'var(--ink-2)'),
                          fontFamily:'var(--sans)', fontSize:12.5, fontWeight: active ? 600 : 500,
                          opacity: locked ? 0.6 : 1,
                          borderLeft: active ? '2px solid var(--terra)' : '2px solid transparent',
                        }}>
                        <ProgressDot status={status} size={9} />
                        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', marginRight:6 }}>{String(m.num).padStart(2,'0')}</span>
                          {m.title}
                        </span>
                        <span style={{ fontFamily:'var(--mono)', fontSize:9.5, color:'var(--muted)' }}>{m.mins}m</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer learner card */}
      <div style={{ borderTop:'1px solid var(--rule)', padding:'14px 18px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--parch-dark)', color:'var(--ink)', display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, fontWeight:500 }}>
          {STATE.learner.name.split(' ').map(p=>p[0]).slice(0,2).join('')}
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:14, lineHeight:1.1, fontWeight:500 }}>{STATE.learner.name}</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginTop:2 }}>{STATE.learner.role}</div>
        </div>
      </div>
    </aside>
  );
}

// ---------- TopBar / breadcrumb ----------
function TopBar({ crumbs, right }){
  return (
    <div style={{ position:'sticky', top:0, zIndex:5, background:'var(--linen)', borderBottom:'1px solid var(--rule)', padding:'14px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24 }}>
      <nav aria-label="Breadcrumb" style={{ fontFamily:'var(--sans)', fontWeight:700, fontSize:12, letterSpacing:'-0.005em', textTransform:'uppercase', color:'var(--slate)', lineHeight:1 }}>
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && <span style={{ margin:'0 10px', color:'rgba(27,24,20,0.2)', fontWeight:400 }}>/</span>}
            <span style={{ color: i === crumbs.length - 1 ? 'var(--ink)' : 'var(--slate)' }}>{c}</span>
          </span>
        ))}
      </nav>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>{right}</div>
    </div>
  );
}

// ---------- Pillar swatch ----------
function PillarTag({ pillarId, size='sm' }){
  const p = PILLARS.find(x => x.id === pillarId);
  if(!p) return null;
  const big = size === 'lg';
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
      <span style={{ width: big?9:7, height: big?9:7, borderRadius:1, background:p.color }} />
      <span style={{ fontFamily:'var(--mono)', fontSize: big ? 10.5 : 9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:p.color, fontWeight:600 }}>{p.label}</span>
    </span>
  );
}

// ---------- Model picker (the Claude/OpenAI/Gemini control) ----------
function ModelLogo({ id, size=22 }){
  const common = { width:size, height:size, borderRadius:size/4, display:'grid', placeItems:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:600, fontSize:size*0.5, color:'var(--paper)', flex:'none' };
  if (id === 'claude') return <span style={{ ...common, background:'#C26B45' }}>C</span>;
  if (id === 'openai') return <span style={{ ...common, background:'#1F1F1F' }}>O</span>;
  if (id === 'gemini') return <span style={{ ...common, background:'#3F6CB0' }}>G</span>;
  return <span style={common}>?</span>;
}

function ModelPicker({ value, onChange, compact=false }){
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const m = MODELS.find(x => x.id === value) || MODELS[0];

  useEffect(()=>{
    function close(e){ if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    window.addEventListener('mousedown', close);
    return ()=>window.removeEventListener('mousedown', close);
  },[]);

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{
          display:'inline-flex', alignItems:'center', gap:10,
          background:'var(--paper)', border:'1px solid var(--rule-strong)',
          borderRadius:2, padding: compact ? '6px 10px' : '8px 12px', cursor:'pointer',
          fontFamily:'var(--sans)', fontSize:12.5, fontWeight:500, color:'var(--ink)',
        }}>
        <ModelLogo id={m.id} size={compact?18:22} />
        <span>Use with <strong style={{ fontWeight:600 }}>{m.name}</strong></span>
        <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)', marginLeft:4 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', right:0, minWidth:300,
          background:'var(--paper)', border:'1px solid var(--rule-strong)',
          borderRadius:3, boxShadow:'0 14px 40px -16px rgba(27,24,20,0.18)',
          padding:6, zIndex:20,
        }}>
          {MODELS.map(opt => (
            <button key={opt.id}
              onClick={()=>{ onChange(opt.id); setOpen(false); }}
              style={{
                display:'flex', alignItems:'center', gap:12, width:'100%',
                background: opt.id === value ? 'var(--terra-soft)' : 'transparent',
                border:'none', cursor:'pointer', padding:'10px 10px', borderRadius:2,
                textAlign:'left',
              }}>
              <ModelLogo id={opt.id} size={26} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:'var(--sans)', fontSize:13, fontWeight:600, color:'var(--ink)' }}>{opt.name} <span style={{ fontWeight:400, color:'var(--muted)', fontSize:11.5 }}>· {opt.vendor}</span></div>
                <div style={{ fontFamily:'var(--sans)', fontSize:11.5, color:'var(--slate)' }}>{opt.tag}</div>
              </div>
              {opt.id === value && <span style={{ color:'var(--terra)', fontFamily:'var(--mono)', fontSize:13 }}>✓</span>}
            </button>
          ))}
          <div style={{ borderTop:'1px solid var(--rule)', margin:'4px 6px 2px', padding:'8px 4px 2px', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)' }}>
            All three are connected via your institution
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Buttons ----------
function PrimaryButton({ children, onClick, ...rest }){
  return (
    <button onClick={onClick} {...rest}
      style={{
        display:'inline-flex', alignItems:'center', gap:10,
        background:'var(--ink)', color:'var(--paper)', border:'none',
        padding:'12px 20px', borderRadius:2, cursor:'pointer',
        fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', fontWeight:600,
        transition:'background .18s ease, transform .18s ease',
        ...rest.style,
      }}
      onMouseEnter={e => e.currentTarget.style.background='var(--terra)'}
      onMouseLeave={e => e.currentTarget.style.background='var(--ink)'}
    >
      {children}
    </button>
  );
}
function GhostButton({ children, onClick, ...rest }){
  return (
    <button onClick={onClick} {...rest}
      style={{
        display:'inline-flex', alignItems:'center', gap:8,
        background:'transparent', color:'var(--ink)',
        border:'1px solid var(--rule-strong)',
        padding:'12px 18px', borderRadius:2, cursor:'pointer',
        fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', fontWeight:600,
        transition:'border-color .18s, color .18s',
        ...rest.style,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--terra)'; e.currentTarget.style.color='var(--terra)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--rule-strong)'; e.currentTarget.style.color='var(--ink)'; }}
    >
      {children}
    </button>
  );
}

// Export
Object.assign(window, {
  Sidebar, TopBar, PillarTag, ProgressDot, ModelPicker, ModelLogo,
  PrimaryButton, GhostButton, BrandLockup, getModuleStatus,
});
