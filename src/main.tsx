import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type Operation = {
  name: string
  location: string
  date: string
  category: string
  status: string
}

const initialOperations: Operation[] = [
  {
    name: 'Voorbeeldoperatie',
    location: 'Nog niet ingesteld',
    date: '—',
    category: 'Nog te bepalen',
    status: 'Concept',
  },
]

function App() {
  const [showPlanner, setShowPlanner] = useState(false)
  const [operations, setOperations] = useState<Operation[]>(initialOperations)
  const [form, setForm] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    type: 'Inspectie',
    flight: 'VLOS',
    altitude: '120',
    environment: 'Open gebied',
  })

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function createOperation(event: React.FormEvent) {
    event.preventDefault()
    const operation: Operation = {
      name: form.name || 'Nieuwe operatie',
      location: form.location || 'Nog niet ingesteld',
      date: form.date || '—',
      category: form.flight === 'BVLOS' ? 'Specific — controleren' : 'Open — controleren',
      status: 'Analyse vereist',
    }
    setOperations((current) => [operation, ...current])
    setShowPlanner(false)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <strong>Drone Ops</strong>
            <span>Operations Planner</span>
          </div>
        </div>
        <nav>
          <button className="nav-item active">Overzicht</button>
          <button className="nav-item">Operaties</button>
          <button className="nav-item">Mijn drones</button>
          <button className="nav-item">Crew</button>
          <button className="nav-item">Regelgeving</button>
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" /> Regelengine v0.1
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Operations</span>
            <h1>Operationeel overzicht</h1>
          </div>
          <button className="primary-button" onClick={() => setShowPlanner(true)}>
            + Nieuwe operatie
          </button>
        </header>

        <section className="hero-card">
          <div>
            <span className="eyebrow">Drone Operations Planner</span>
            <h2>Plan een operatie. Controleer de regels. Vlieg voorbereid.</h2>
            <p>
              Leg je operatie vast en laat de planner bepalen welke regelgeving,
              risico's en maatregelen relevant zijn.
            </p>
            <button className="primary-button" onClick={() => setShowPlanner(true)}>
              Start een operatie →
            </button>
          </div>
          <div className="hero-orbit">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="drone-icon">✦</div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card"><span>Operaties</span><strong>{operations.length}</strong><small>opgeslagen</small></div>
          <div className="stat-card"><span>Analyse</span><strong>—</strong><small>nog geen resultaten</small></div>
          <div className="stat-card"><span>Compliance</span><strong>—</strong><small>wordt automatisch bepaald</small></div>
          <div className="stat-card"><span>Regio</span><strong>NL</strong><small>EU + Nederland</small></div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div><span className="eyebrow">Workspace</span><h3>Recente operaties</h3></div>
            <button className="text-button" onClick={() => setShowPlanner(true)}>Nieuwe operatie →</button>
          </div>
          <div className="operation-list">
            {operations.map((operation, index) => (
              <div className="operation-row" key={`${operation.name}-${index}`}>
                <div className="operation-symbol">◎</div>
                <div className="operation-main"><strong>{operation.name}</strong><span>{operation.location}</span></div>
                <div className="operation-meta"><span>{operation.date}</span><span>{operation.category}</span></div>
                <span className={`pill ${operation.status === 'Concept' ? 'neutral' : 'warning'}`}>{operation.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="roadmap-card">
          <div><span className="eyebrow">Build roadmap</span><h3>Van operatie naar compleet operationeel plan</h3></div>
          <div className="roadmap">
            <span className="done">01 Operatie</span><span>02 Regelgeving</span><span>03 Luchtruim</span><span>04 Risicoanalyse</span><span>05 Operationeel plan</span>
          </div>
        </section>
      </main>

      {showPlanner && (
        <div className="modal-backdrop" onMouseDown={() => setShowPlanner(false)}>
          <div className="planner-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><span className="eyebrow">Stap 1 van 5</span><h2>Nieuwe operatie</h2></div><button className="close-button" onClick={() => setShowPlanner(false)}>×</button></div>
            <div className="progress"><span /></div>
            <form onSubmit={createOperation}>
              <div className="form-grid">
                <label>Naam operatie<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Bijv. inspectie windturbine" autoFocus /></label>
                <label>Locatie<input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Plaats of adres" /></label>
                <label>Datum<input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} /></label>
                <label>Starttijd<input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} /></label>
                <label>Type operatie<select value={form.type} onChange={(e) => update('type', e.target.value)}><option>Inspectie</option><option>Fotografie / video</option><option>Mapping / surveying</option><option>Transport</option><option>Overig</option></select></label>
                <label>Vluchtuitvoering<select value={form.flight} onChange={(e) => update('flight', e.target.value)}><option>VLOS</option><option>EVLOS</option><option>BVLOS</option></select></label>
                <label>Max. geplande hoogte (m)<input type="number" value={form.altitude} onChange={(e) => update('altitude', e.target.value)} /></label>
                <label>Omgeving<select value={form.environment} onChange={(e) => update('environment', e.target.value)}><option>Open gebied</option><option>Stedelijk gebied</option><option>Industrieel gebied</option><option>Landelijk gebied</option></select></label>
              </div>
              <div className="notice"><strong>Automatische analyse</strong><span>Na het aanmaken controleren we categorie, luchtruim, geozones, regelgeving en benodigde maatregelen.</span></div>
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowPlanner(false)}>Annuleren</button><button type="submit" className="primary-button">Operatie aanmaken →</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
