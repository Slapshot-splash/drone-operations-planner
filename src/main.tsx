import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createOperation, listOperations, updateOperation, type StoredOperation } from './lib/operations'
import './styles.css'

type Operation = StoredOperation
type PlannerData = {
  name: string; location: string; date: string; time: string; type: string; flight: string; altitude: string; environment: string
  drone: string; mtom: string; cClass: string; pilot: string; crew: string; airspace: string; people: string; night: string
  weather: string; groundArea: string; mitigations: string[]
}
const steps = ['Operatie', 'UAS & crew', 'Luchtruim', 'Regelgeving', 'Risicoanalyse', 'Maatregelen', 'Operationeel plan']
const emptyPlanner: PlannerData = {
  name:'', location:'', date:'', time:'', type:'Inspectie', flight:'VLOS', altitude:'120', environment:'Open gebied', drone:'', mtom:'',
  cClass:'Onbekend', pilot:'', crew:'Geen extra crew', airspace:'Nog niet gecontroleerd', people:'Geen personen verwacht', night:'Dag',
  weather:'Voldoende zicht en wind binnen limieten', groundArea:'Nog te bepalen', mitigations:[],
}

function App() {
  const [showPlanner,setShowPlanner]=useState(false), [step,setStep]=useState(0), [operationId,setOperationId]=useState<string|null>(null)
  const [operations,setOperations]=useState<Operation[]>([]), [form,setForm]=useState<PlannerData>(emptyPlanner)
  const [message,setMessage]=useState(''), [saveState,setSaveState]=useState<'saved'|'saving'|'error'>('saved')

  const classification=useMemo(()=>{
    if(form.flight==='BVLOS') return {label:'Specific',tone:'warning',reason:'BVLOS geselecteerd; Open is niet van toepassing.'}
    if(Number(form.altitude)>120) return {label:'Specific?',tone:'warning',reason:'Geplande hoogte is boven de standaard Open-limiet; dit vereist controle.'}
    return {label:'Open — controleren',tone:'neutral',reason:'VLOS en hoogte tot 120 m. Definitieve classificatie volgt uit de volledige operatie.'}
  },[form.flight,form.altitude])

  useEffect(()=>{ loadOperations() },[])
  async function loadOperations(){
    try { setOperations(await listOperations()); setMessage('') }
    catch(error){ setMessage(error instanceof Error ? error.message : 'Operaties konden niet worden geladen.') }
  }

  useEffect(()=>{
    if(!showPlanner || !operationId) return
    setSaveState('saving')
    const timer=window.setTimeout(async()=>{
      try {
        await updateOperation(operationId,{name:form.name||'Nieuwe operatie',location:form.location||'Nog niet ingesteld',date:form.date,category:classification.label,plannerData:{...form,step}})
        setSaveState('saved'); await loadOperations()
      } catch(error){ console.error(error); setSaveState('error') }
    },700)
    return ()=>window.clearTimeout(timer)
  },[form,step,classification.label,operationId,showPlanner])

  function update(key:keyof PlannerData,value:string|string[]){ setForm(current=>({...current,[key]:value})) }
  function toggleMitigation(value:string){ setForm(current=>({...current,mitigations:current.mitigations.includes(value)?current.mitigations.filter(item=>item!==value):[...current.mitigations,value]})) }

  async function openNewPlanner(){
    setMessage('')
    try {
      const created=await createOperation({name:'Nieuwe operatie',location:'Nog niet ingesteld',date:'',category:'Open — controleren',plannerData:{...emptyPlanner,step:0}})
      setOperations(current=>[created,...current]); setOperationId(created.id); setForm(emptyPlanner); setStep(0); setSaveState('saved'); setShowPlanner(true)
    } catch(error){ setMessage(error instanceof Error ? error.message : 'Nieuwe operatie kon niet worden aangemaakt.') }
  }

  function openExisting(operation:Operation){
    const saved=operation.planner_data ?? {}
    const restored={...emptyPlanner,...saved} as PlannerData & {step?:number}
    setForm(restored); setStep(typeof restored.step==='number'?Math.min(Math.max(restored.step,0),steps.length-1):0)
    setOperationId(operation.id); setSaveState('saved'); setMessage(''); setShowPlanner(true)
  }

  async function closePlanner(){
    if(saveState==='saving') await new Promise(resolve=>window.setTimeout(resolve,800))
    setShowPlanner(false); setOperationId(null); setStep(0); setForm(emptyPlanner); await loadOperations()
  }
  async function finishOperation(){
    if(!operationId) return
    setSaveState('saving')
    try { await updateOperation(operationId,{name:form.name||'Nieuwe operatie',location:form.location||'Nog niet ingesteld',date:form.date,category:classification.label,status:'Concept',plannerData:{...form,step:6}}); setSaveState('saved'); await closePlanner() }
    catch(error){ setSaveState('error'); setMessage(error instanceof Error?error.message:'Opslaan mislukt.') }
  }
  function nextStep(){setStep(current=>Math.min(current+1,steps.length-1))}
  function previousStep(){setStep(current=>Math.max(current-1,0))}
  const field=(label:string,key:keyof PlannerData,placeholder='')=><label>{label}<input value={String(form[key])} onChange={e=>update(key,e.target.value)} placeholder={placeholder}/></label>

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">D</div><div><strong>Drone Ops</strong><span>Operations Planner</span></div></div>
      <nav><button className="nav-item active">Overzicht</button><button className="nav-item">Operaties</button><button className="nav-item">Mijn drones</button><button className="nav-item">Crew</button><button className="nav-item">Regelgeving</button></nav>
      <div className="sidebar-footer"><span className="status-dot"/> Regelengine v0.1</div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><span className="eyebrow">Operations</span><h1>Operationeel overzicht</h1></div><button className="primary-button" onClick={openNewPlanner}>+ Nieuwe operatie</button></header>
      {message&&<div className="empty-state" style={{marginBottom:20}}><strong>{message}</strong></div>}
      <section className="hero-card"><div><span className="eyebrow">Drone Operations Planner</span><h2>Plan een operatie. Controleer de regels. Vlieg voorbereid.</h2><p>Doorloop de operatie van missiegegevens tot risico's en maatregelen. De regelgeving-engine wordt stap voor stap aan deze workflow gekoppeld.</p><button className="primary-button" onClick={openNewPlanner}>Start een operatie →</button></div><div className="hero-orbit"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="drone-icon">✦</div></div></section>
      <section className="stats-grid"><div className="stat-card"><span>Operaties</span><strong>{operations.length}</strong><small>opgeslagen in Supabase</small></div><div className="stat-card"><span>Analyse</span><strong>{operations.length?'In opbouw':'—'}</strong><small>regelengine v0.1</small></div><div className="stat-card"><span>Compliance</span><strong>NL</strong><small>EU + Nederland</small></div><div className="stat-card"><span>Workflow</span><strong>7</strong><small>planningsstappen</small></div></section>
      <section className="content-section"><div className="section-heading"><div><span className="eyebrow">Workspace</span><h3>Recente operaties</h3></div><button className="text-button" onClick={openNewPlanner}>Nieuwe operatie →</button></div>
        <div className="operation-list">{operations.length===0?<div className="empty-state"><strong>Nog geen operaties</strong><span>Maak je eerste operatie aan om de planner te starten.</span><button className="secondary-button" onClick={openNewPlanner}>Nieuwe operatie</button></div>:operations.map(operation=><button className="operation-row" key={operation.id} onClick={()=>openExisting(operation)}><div className="operation-symbol">◎</div><div className="operation-main"><strong>{operation.name}</strong><span>{operation.location}</span></div><div className="operation-meta"><span>{operation.date||'—'}</span><span>{operation.category}</span></div><span className="pill neutral">{operation.status}</span></button>)}</div>
      </section>
      <section className="roadmap-card"><div><span className="eyebrow">Build roadmap</span><h3>Van operatie naar compleet operationeel plan</h3></div><div className="roadmap">{steps.map((item,index)=><span className={index===0?'done':''} key={item}>{String(index+1).padStart(2,'0')} {item}</span>)}</div></section>
    </main>

    {showPlanner&&<div className="modal-backdrop"><div className="planner-modal planner-large">
      <div className="modal-header"><div><span className="eyebrow">Operation planner · stap {step+1} van {steps.length}</span><h2>{steps[step]}</h2></div><div style={{display:'flex',alignItems:'center',gap:16}}><span style={{fontSize:12,color:saveState==='error'?'#ff9d9d':'#8fa0b8'}}>{saveState==='saving'?'Opslaan…':saveState==='error'?'Opslaan mislukt':'Opgeslagen'}</span><button className="close-button" onClick={closePlanner}>×</button></div></div>
      <div className="wizard-layout"><div className="wizard-steps">{steps.map((item,index)=><button key={item} className={`${index===step?'current':''} ${index<step?'complete':''}`} onClick={()=>index<=step&&setStep(index)}><span>{index<step?'✓':index+1}</span>{item}</button>)}</div>
        <div className="wizard-content">
          {step===0&&<><p className="step-intro">Beschrijf de geplande operatie. Deze gegevens vormen de basis voor de classificatie en latere risicoanalyse.</p><div className="form-grid">{field('Naam operatie','name','Bijv. inspectie windturbine')}{field('Locatie','location','Plaats of adres')}{field('Datum','date')}{field('Starttijd','time')}<label>Type operatie<select value={form.type} onChange={e=>update('type',e.target.value)}><option>Inspectie</option><option>Fotografie / video</option><option>Mapping / surveying</option><option>Transport</option><option>Overig</option></select></label><label>Vluchtuitvoering<select value={form.flight} onChange={e=>update('flight',e.target.value)}><option>VLOS</option><option>EVLOS</option><option>BVLOS</option></select></label>{field('Max. geplande hoogte (m)','altitude','120')}<label>Omgeving<select value={form.environment} onChange={e=>update('environment',e.target.value)}><option>Open gebied</option><option>Stedelijk gebied</option><option>Industrieel gebied</option><option>Landelijk gebied</option></select></label></div></>}
          {step===1&&<><p className="step-intro">Leg het gebruikte UAS en de operationele crew vast.</p><div className="form-grid">{field('Drone / UAS','drone','Bijv. DJI Matrice 4E')}{field('MTOM (kg)','mtom','Bijv. 6.1')}<label>C-klasse<select value={form.cClass} onChange={e=>update('cClass',e.target.value)}><option>Onbekend</option><option>C0</option><option>C1</option><option>C2</option><option>C3</option><option>C4</option><option>Geen C-klasse</option></select></label>{field('Remote pilot','pilot','Naam piloot')}<label>Crew / observers<select value={form.crew} onChange={e=>update('crew',e.target.value)}><option>Geen extra crew</option><option>1 observer</option><option>Meerdere crewleden</option></select></label></div></>}
          {step===2&&<><p className="step-intro">Hier komt de kaart- en geozone-analyse. Voor nu registreren we de relevante operationele omstandigheden.</p><div className="airspace-placeholder"><div className="map-grid"><span>MAP</span></div><div><strong>Luchtruimcontrole</strong><p>Locatie: {form.location||'Nog niet ingevuld'}</p><button className="secondary-button" type="button">Locatie controleren (volgende versie)</button></div></div><div className="form-grid compact"><label>Bekend luchtruim<select value={form.airspace} onChange={e=>update('airspace',e.target.value)}><option>Nog niet gecontroleerd</option><option>Ongecontroleerd luchtruim</option><option>Gecontroleerd luchtruim</option><option>UAS-geozone aanwezig</option></select></label>{field('Grondgebied / operationeel gebied','groundArea','Bijv. 150 × 100 m')}</div></>}
          {step===3&&<><p className="step-intro">De regelengine geeft hier straks een onderbouwde classificatie. Dit scherm gebruikt nu nog geen definitieve juridische beoordeling.</p><div className={`classification-card ${classification.tone}`}><div><span className="eyebrow">Voorlopige classificatie</span><strong>{classification.label}</strong><p>{classification.reason}</p></div><span className="classification-badge">NL / EU</span></div><div className="check-grid"><div><strong>Open categorie</strong><span>{form.flight==='BVLOS'?'Niet passend bij BVLOS':'Verder controleren'}</span></div><div><strong>Specific</strong><span>{form.flight==='BVLOS'||Number(form.altitude)>120?'Waarschijnlijk relevant':'Niet direct geïndiceerd'}</span></div><div><strong>STS / PDRA</strong><span>Later bepalen op basis van operatieprofiel</span></div><div><strong>SORA</strong><span>Later bepalen op basis van classificatie</span></div></div></>}
          {step===4&&<><p className="step-intro">Maak een eerste operationele risico-inventarisatie. De echte SORA-methodiek voegen we gecontroleerd toe nadat de basisworkflow staat.</p><div className="risk-grid"><label>Personen in/naast gebied<select value={form.people} onChange={e=>update('people',e.target.value)}><option>Geen personen verwacht</option><option>Incidenteel personen aanwezig</option><option>Veel personen aanwezig</option><option>Assembly of people</option></select></label><label>Dag / nacht<select value={form.night} onChange={e=>update('night',e.target.value)}><option>Dag</option><option>Nacht</option></select></label><label>Weersverwachting<select value={form.weather} onChange={e=>update('weather',e.target.value)}><option>Voldoende zicht en wind binnen limieten</option><option>Twijfelachtig — controleren voor vlucht</option><option>Ongeschikt</option></select></label></div><div className="risk-summary"><span className="risk-indicator"/><div><strong>Voorlopige risico-aandacht</strong><p>De uiteindelijke beoordeling moet rekening houden met ground risk, air risk, C2/link, contingencies en relevante mitigaties.</p></div></div></>}
          {step===5&&<><p className="step-intro">Selecteer de maatregelen die je voor deze operatie wilt opnemen.</p><div className="mitigation-list">{['VLOS gedurende de gehele operatie','Operationeel gebied fysiek afzetten','Observer inzetten','Pre-flight weercheck','C2-link contingency procedure','Noodlandingsgebied vastleggen','Communicatieplan / crew briefing','NOTAM en luchtruimstatus controleren'].map(item=><label className={`mitigation ${form.mitigations.includes(item)?'selected':''}`} key={item}><input type="checkbox" checked={form.mitigations.includes(item)} onChange={()=>toggleMitigation(item)}/><span>{item}</span></label>)}</div></>}
          {step===6&&<><p className="step-intro">Controleer het voorlopige plan. De gegevens zijn nu opgeslagen in Supabase en kunnen later opnieuw worden geopend.</p><div className="plan-preview"><div className="plan-title"><span className="eyebrow">OPERATION PLAN · DRAFT</span><h3>{form.name||'Nieuwe operatie'}</h3><span>{form.location||'Locatie nog niet ingevuld'} · {form.date||'Datum nog niet ingevuld'}</span></div><div className="plan-columns"><div><strong>Operatie</strong><span>{form.type} · {form.flight} · max. {form.altitude||'—'} m</span></div><div><strong>UAS</strong><span>{form.drone||'Nog niet ingevuld'} · {form.mtom||'—'} kg</span></div><div><strong>Classificatie</strong><span>{classification.label}</span></div><div><strong>Maatregelen</strong><span>{form.mitigations.length} geselecteerd</span></div></div><div className="plan-status"><span className="status-dot"/> Concept — nog geen definitieve compliance-beoordeling</div></div></>}
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={step===0?closePlanner:previousStep}>{step===0?'Sluiten':'← Vorige'}</button>{step<steps.length-1?<button type="button" className="primary-button" onClick={nextStep}>Volgende →</button>:<button type="button" className="primary-button" onClick={finishOperation}>Operatie opslaan</button>}</div>
        </div>
      </div></div>
    </div>}
  </div>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
