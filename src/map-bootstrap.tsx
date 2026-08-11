import { createRoot } from 'react-dom/client'
import React, { useState } from 'react'
import OperationMap from './components/OperationMap'

type SavedPosition = [number, number] | null

function EmbeddedMap() {
  const stored = localStorage.getItem('drone-operation-position')
  const [position, setPosition] = useState<SavedPosition>(stored ? JSON.parse(stored) : null)

  function select(lat: number, lng: number) {
    const next: [number, number] = [lat, lng]
    setPosition(next)
    localStorage.setItem('drone-operation-position', JSON.stringify(next))
  }

  return <OperationMap position={position} radius={250} onSelect={select} />
}

function mountMaps() {
  document.querySelectorAll<HTMLElement>('.map-grid').forEach((host) => {
    if (host.dataset.mapMounted) return
    host.dataset.mapMounted = 'true'
    host.innerHTML = ''
    host.classList.add('interactive-map-host')
    createRoot(host).render(<React.StrictMode><EmbeddedMap /></React.StrictMode>)
  })
}

const observer = new MutationObserver(mountMaps)
observer.observe(document.body, { childList: true, subtree: true })
mountMaps()
