/* global React */
// Minimal Tweaks panel inline (avoids dependency on starter component to ship faster)

const { useEffect: useEff, useState: useS } = React;

function useTweaks(defaults){
  const [t, setT] = useS(()=>({ ...defaults, ...(window.__TWEAKS__ || {}) }));
  const update = (k, v) => {
    const edits = typeof k === 'object' ? k : { [k]: v };
    setT(prev => ({ ...prev, ...edits }));
    try { window.parent.postMessage({ type:'__edit_mode_set_keys', edits }, '*'); } catch(e){}
  };
  return [t, update];
}

function TweaksPanel({ open, onClose, children, title='Tweaks' }){
  if(!open) return null;
  return (
    <div style={{
      position:'fixed', right:18, bottom:18, zIndex:50,
      width:300, maxHeight:'72vh', overflowY:'auto',
      background:'var(--paper)', border:'1px solid var(--rule-strong)', borderRadius:3,
      boxShadow:'0 24px 60px -28px rgba(27,24,20,0.35)',
      fontFamily:'var(--sans)',
    }}>
      <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--terra)', fontWeight:600 }}>{title}</span>
        <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:16, color:'var(--muted)' }}>×</button>
      </div>
      <div style={{ padding:'14px 14px 18px' }}>{children}</div>
    </div>
  );
}

function TweakSection({ label, children }){
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>{label}</div>
      {children}
    </div>
  );
}

function TweakRadio({ value, options, onChange }){
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${options.length},1fr)`, gap:0, border:'1px solid var(--rule-strong)', borderRadius:2, overflow:'hidden' }}>
      {options.map((o, i) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        const active = v === value;
        return (
          <button key={v} onClick={()=>onChange(v)}
            style={{
              padding:'7px 6px', cursor:'pointer',
              background: active ? 'var(--ink)' : 'var(--paper)',
              color: active ? 'var(--paper)' : 'var(--ink-2)',
              border:'none', borderLeft: i>0 ? '1px solid var(--rule-strong)' : 'none',
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600,
            }}>{l}</button>
        );
      })}
    </div>
  );
}

Object.assign(window, { useTweaks, TweaksPanel, TweakSection, TweakRadio });
