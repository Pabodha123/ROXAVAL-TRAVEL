import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RouteStop {
  dayNumber: number;
  name: string;
  lat: number;
  lng: number;
}

const numberedIcon = (n: number) =>
  L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:#1a7a5e;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);color:#fff;font-family:sans-serif;font-size:12px;font-weight:700;">${n}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

// Fits the map's viewport to every stop once the stops are known, since
// MapContainer only accepts a fixed initial `bounds` prop on first render.
function FitBounds({ stops }: { stops: RouteStop[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (stops.length === 0) return;
    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 9);
      return;
    }
    map.fitBounds(stops.map((s) => [s.lat, s.lng] as [number, number]), { padding: [30, 30] });
  }, [stops, map]);
  return null;
}

/**
 * Numbered day-by-day route on a Sri Lanka map — built from each day's
 * destination coordinates (Destination.mapLocation), deduplicated so a
 * multi-day stay in one place doesn't stack repeat markers.
 */
export function RouteMap({ days }: { days: { dayNumber: number; destinations?: { name: string; mapLocation?: { lat?: number; lng?: number } }[] }[] }) {
  const stops = useMemo(() => {
    const result: RouteStop[] = [];
    days.forEach((d) => {
      const dest = d.destinations?.[0];
      const lat = dest?.mapLocation?.lat;
      const lng = dest?.mapLocation?.lng;
      if (!dest || lat == null || lng == null) return;
      const prev = result[result.length - 1];
      if (prev && prev.name === dest.name) return;
      result.push({ dayNumber: d.dayNumber, name: dest.name, lat, lng });
    });
    return result;
  }, [days]);

  if (stops.length === 0) return null;

  return (
    <div className="mt-8 border-b border-forest/10 pb-8 print:break-inside-avoid">
      <p className="font-display text-sm font-semibold text-forest">Trip Itinerary Route</p>
      <div className="mt-3 h-80 w-full overflow-hidden rounded-2xl border border-forest/10">
        <MapContainer center={[7.8731, 80.7718]} zoom={7} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <Polyline
            positions={stops.map((s) => [s.lat, s.lng])}
            pathOptions={{ color: '#1a7a5e', weight: 2.5, dashArray: '6 6' }} />
          {stops.map((s, i) =>
            <Marker key={i} position={[s.lat, s.lng]} icon={numberedIcon(s.dayNumber)} />
          )}
          <FitBounds stops={stops} />
        </MapContainer>
      </div>
    </div>
  );
}
