/* global React, ReactDOM */
// App — routing + tweaks wiring

const { useState: uS, useEffect: uE } = React;
const { Sidebar, OverviewScreen, ModuleScreen, ToolboxScreen, CompleteScreen, useTweaks, TweaksPanel, TweakSection, TweakRadio } = window;

function App(){
  const [route, setRoute] = uS({ name: 'overview' });
  const [tweaksOpen, setTweaksOpen] = uS(false);
  const [tweaks, setTweaks] = useTweaks({ density:'roomy', progress:'quiet', layout:'split', layoutOverrides:{} });

  // Apply density / progress / layout to body data attrs (CSS hooks if needed)
  uE(()=>{
    document.body.dataset.density = tweaks.density;
    document.body.dataset.progress = tweaks.progress;
    document.body.dataset.layout = tweaks.layout;
  }, [tweaks.density, tweaks.progress, tweaks.layout]);

  function setModuleLayout(num, layout){
    const next = { ...(tweaks.layoutOverrides || {}), [num]: layout };
    setTweaks('layoutOverrides', next);
  }
  function getModuleLayout(num){
    return (tweaks.layoutOverrides && tweaks.layoutOverrides[num]) || tweaks.layout;
  }

  // Tweak toolbar handshake
  uE(()=>{
    function onMsg(e){
      const d = e.data || {};
      if (d.type === '__activate_edit_mode')   setTweaksOpen(true);
      if (d.type === '__deactivate_edit_mode') setTweaksOpen(false);
    }
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({ type:'__edit_mode_available' }, '*'); } catch(e){}
    return ()=>window.removeEventListener('message', onMsg);
  }, []);

  // Scroll to top on route change
  uE(()=>{ window.scrollTo({ top:0, behavior:'instant' }); }, [route.name, route.num]);

  function navigate(r){ setRoute(r); }

  return (
    <div className="app">
      <Sidebar route={route} navigate={navigate} density={tweaks.density} />
      <main style={{ minWidth:0 }}>
        {route.name === 'overview' && <OverviewScreen navigate={navigate} progress={tweaks.progress} />}
        {route.name === 'module'   && <ModuleScreen num={route.num} navigate={navigate} layout={getModuleLayout(route.num)} setLayout={(l)=>setModuleLayout(route.num, l)} progress={tweaks.progress} defaultLayout={tweaks.layout} hasOverride={!!(tweaks.layoutOverrides && tweaks.layoutOverrides[route.num])} clearOverride={()=>{ const next={...(tweaks.layoutOverrides||{})}; delete next[route.num]; setTweaks('layoutOverrides', next); }} />}
        {route.name === 'toolbox'  && <ToolboxScreen navigate={navigate} />}
        {route.name === 'complete' && <CompleteScreen navigate={navigate} />}
      </main>

      <TweaksPanel open={tweaksOpen} onClose={()=>{ setTweaksOpen(false); try{ window.parent.postMessage({ type:'__edit_mode_dismissed' }, '*'); }catch(e){} }}>
        <TweakSection label="Sidebar density">
          <TweakRadio value={tweaks.density}
            options={[{value:'roomy', label:'Roomy'}, {value:'compact', label:'Compact'}]}
            onChange={v => setTweaks('density', v)} />
        </TweakSection>
        <TweakSection label="Progress treatment">
          <TweakRadio value={tweaks.progress}
            options={[{value:'quiet', label:'Quiet'}, {value:'gameful', label:'Gameful'}]}
            onChange={v => setTweaks('progress', v)} />
          <p style={{ margin:'6px 0 0', fontSize:11, color:'var(--muted)', lineHeight:1.4 }}>
            Quiet uses dots + ratios. Gameful (next iteration) adds streaks & badges.
          </p>
        </TweakSection>
        <TweakSection label="Default module layout">
          <TweakRadio value={tweaks.layout}
            options={[
              {value:'split', label:'Split'},
              {value:'stepped', label:'Stepped'},
              {value:'longform', label:'Long-form'},
            ]}
            onChange={v => setTweaks('layout', v)} />
          <p style={{ margin:'6px 0 0', fontSize:11, color:'var(--muted)', lineHeight:1.4 }}>
            Default for any module without its own layout. Each module page has its own switcher.
          </p>
        </TweakSection>

        <TweakSection label="Jump to a module">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:4 }}>
            {Array.from({length:12}, (_,i)=>i+1).map(n => (
              <button key={n} onClick={()=>navigate({ name:'module', num:n })}
                style={{
                  padding:'7px 0', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10,
                  background: route.name==='module' && route.num===n ? 'var(--terra)' : 'var(--paper)',
                  color: route.name==='module' && route.num===n ? 'var(--paper)' : 'var(--ink-2)',
                  border:'1px solid var(--rule-strong)', borderRadius:2, fontWeight:600,
                }}>
                {String(n).padStart(2,'0')}
              </button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
