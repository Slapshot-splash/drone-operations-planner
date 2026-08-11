import { useEffect, useState } from 'react'
import { Circle, MapContainer, Marker, TileLayer, WMSTileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const NL_CENTER: LatLngExpression = [52.15, 5.35]
const AERET_WMS_URL = import.meta.env.VITE_AERET_WMS_URL as string | undefined
const AERET_WMS_LAYERS = import.meta.env.VITE_AERET_WMS_LAYERS as string | undefined

const droneIcon = L.divIcon({ className: 'operation-marker', html: '<span></span>', iconSize: [20, 20], iconAnchor: [10, 10] })

function MapClick({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (event) => onSelect(event.latlng.lat, event.latlng.lng) })
  return null
}

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.8 })
  }, [map, position])
  return null
}

export default function OperationMap({ position, radius, onSelect }: { position: [number, number] | null; radius: number; onSelect: (lat: number, lng: number) => void }) {
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

  function locateMe() {
    if (!navigator.geolocation) {
      setLocationError('Locatievoorziening wordt niet ondersteund door deze browser.')
      return
    }
    setLocating(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { onSelect(coords.latitude, coords.longitude); setLocating(false) },
      () => { setLocationError('Locatie kon niet worden opgehaald. Controleer de browsertoestemming.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="map-shell">
      <MapContainer center={NL_CENTER} zoom={8} scrollWheelZoom className="operation-map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {AERET_WMS_URL && AERET_WMS_LAYERS && <WMSTileLayer url={AERET_WMS_URL} layers={AERET_WMS_LAYERS} format="image/png" transparent opacity={0.7} />}
        <MapClick onSelect={onSelect} />
        <FlyTo position={position} />
        {position && <><Marker position={position} icon={droneIcon} /><Circle center={position} radius={radius} pathOptions={{ fillOpacity: 0.08, weight: 2 }} /></>}
      </MapContainer>
      <div className="map-controls"><button className="map-control-button" type="button" onClick={locateMe}>{locating ? 'Locatie ophalen…' : '⌖ Mijn locatie'}</button><span>Klik op de kaart om het operatiepunt te kiezen</span></div>
      {locationError && <div className="map-error">{locationError}</div>}
      <div className={`map-source ${AERET_WMS_URL && AERET_WMS_LAYERS ? 'connected' : ''}`}><span className="status-dot" />{AERET_WMS_URL && AERET_WMS_LAYERS ? 'Aeret-luchtvaartlaag actief' : 'Aeret-luchtvaartlaag: API-koppeling nog niet geconfigureerd'}</div>
    </div>
  )
}
