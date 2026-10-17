import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import type { CoursePin } from '../lib/courses'

interface Props {
  pins: CoursePin[]
  center?: [number, number]
  zoom?: number
}

const UK_CENTER: [number, number] = [54.5, -3]

export function CourseMap({ pins, center = UK_CENTER, zoom = 5 }: Props) {
  return (
    <MapContainer
      key={center.join()}
      center={center}
      zoom={zoom}
      preferCanvas
      className="h-72 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lon]}
          radius={5}
          pathOptions={{ color: '#15803d', fillOpacity: 0.8, weight: 1 }}
        >
          <Popup>
            <Link to={`/courses/${encodeURIComponent(p.id)}`}>{p.name}</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
