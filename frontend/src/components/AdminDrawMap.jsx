import { useEffect, useRef } from 'react';
import { YMaps, Map, Polygon } from '@pbe/react-yandex-maps';

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

export default function AdminDrawMap({
  center,
  address,
  polygonCoords,
  onPolygonChange,
  onResolve,
  onResolveStart,
  onResolveEnd,
  resolveEnabled = true,
}) {
  const mapRef = useRef(null);
  const drawModeRef = useRef(false);
  const polygonRef = useRef(null);
  const lastAddressRef = useRef('');
  const lastGeometryRef = useRef('');

  useEffect(() => {
    if (mapRef.current && center && center[0] && center[1]) {
      mapRef.current.setCenter(center, 17, { duration: 300 });
    }
  }, [center]);

  useEffect(() => {
    if (Array.isArray(polygonCoords) && polygonCoords.length >= 3) {
      lastGeometryRef.current = JSON.stringify(polygonCoords);
    } else {
      lastGeometryRef.current = '';
    }
  }, [polygonCoords]);

  const normalizePolygon = (geojson) => {
    if (!geojson) return null;
    if (geojson.type === 'Polygon' && geojson.coordinates?.length) {
      return geojson.coordinates[0].map(([lng, lat]) => [lat, lng]);
    }
    if (geojson.type === 'MultiPolygon' && geojson.coordinates?.length) {
      return geojson.coordinates[0][0].map(([lng, lat]) => [lat, lng]);
    }
    return null;
  };

  const fetchBuildingOutline = async (lat, lng) => {
    const overpassQuery = `[out:json];way["building"](around:40,${lat},${lng});out geom;`;
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: overpassQuery,
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.elements || !data.elements.length) return null;
    const best = data.elements
      .filter((item) => Array.isArray(item.geometry) && item.geometry.length >= 3)
      .sort((a, b) => b.geometry.length - a.geometry.length)[0];
    if (!best || !best.geometry) return null;
    return best.geometry.map((point) => [point.lat, point.lon]);
  };

  const resolveAddress = async (rawAddress) => {
    const query = rawAddress.includes('Tomsk') ? rawAddress : `${rawAddress}, Tomsk`;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&polygon_geojson=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) return null;
    const first = results[0];
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);
    let polygon = normalizePolygon(first.geojson);
    if (!polygon) {
      polygon = await fetchBuildingOutline(lat, lng);
    }
    return { lat, lng, polygonCoords: polygon };
  };

  useEffect(() => {
    if (!resolveEnabled) return;
    if (!address || address.trim().length < 5) return;
    if (address === lastAddressRef.current) return;

    const handle = setTimeout(async () => {
      lastAddressRef.current = address;
      if (onResolveStart) onResolveStart();
      try {
        const resolved = await resolveAddress(address);
        if (!resolved) return;
        const { lat, lng, polygonCoords: resolvedPolygon } = resolved;
        if (mapRef.current && lat && lng) {
          mapRef.current.setCenter([lat, lng], 17, { duration: 300 });
        }
        if (resolvedPolygon && resolvedPolygon.length >= 3) {
          onPolygonChange(resolvedPolygon);
        }
        if (onResolve) {
          onResolve({ lat, lng, polygonCoords: resolvedPolygon || [] });
        }
      } catch {
        // ignore resolve errors
      } finally {
        if (onResolveEnd) onResolveEnd();
      }
    }, 600);

    return () => clearTimeout(handle);
  }, [address, resolveEnabled, onPolygonChange, onResolve, onResolveStart, onResolveEnd]);

  const handleMapClick = (e) => {
    if (!drawModeRef.current) return;
    const coords = e.get('coords');
    const next = Array.isArray(polygonCoords) ? [...polygonCoords, coords] : [coords];
    onPolygonChange(next);
  };

  const handleStartDraw = () => {
    drawModeRef.current = true;
    onPolygonChange([]);
  };

  const handleStopDraw = () => {
    drawModeRef.current = false;
  };

  const handleClear = () => {
    drawModeRef.current = false;
    onPolygonChange([]);
  };

  const handleEditStart = () => {
    if (polygonRef.current?.editor) {
      polygonRef.current.editor.startEditing();
    }
  };

  const handleEditStop = () => {
    if (polygonRef.current?.editor) {
      polygonRef.current.editor.stopEditing();
    }
  };

  const handleGeometryChange = () => {
    const coords = polygonRef.current?.geometry?.getCoordinates?.();
    if (coords && coords[0]) {
      const next = coords[0];
      const nextKey = JSON.stringify(next);
      if (nextKey === lastGeometryRef.current) return;
      lastGeometryRef.current = nextKey;
      onPolygonChange(next);
    }
  };

  const fillColor = 'rgba(255, 120, 60, 0.6)';
  const strokeColor = '#ff6b35';

  return (
    <div className="admin-map-wrapper">
      <div className="admin-map-controls">
        <button type="button" className="btn btn-small" onClick={handleStartDraw}>
          Начать обвод
        </button>
        <button type="button" className="btn btn-small" onClick={handleEditStart}>
          Редактировать
        </button>
        <button type="button" className="btn btn-small" onClick={handleEditStop}>
          Завершить правку
        </button>
        <button type="button" className="btn btn-small" onClick={handleStopDraw}>
          Завершить обвод
        </button>
        <button type="button" className="btn btn-small btn-delete" onClick={handleClear}>
          Очистить
        </button>
      </div>

      <YMaps query={{ apikey: YANDEX_API_KEY }}>
        <Map
          instanceRef={mapRef}
          defaultState={{
            center: center || [56.4866, 84.9719],
            zoom: 16,
          }}
          width="100%"
          height="100%"
          onClick={handleMapClick}
          options={{
            suppressMapOpenBlock: true,
          }}
        >
          {Array.isArray(polygonCoords) && polygonCoords.length >= 3 && (
            <Polygon
              instanceRef={polygonRef}
              geometry={[polygonCoords]}
              modules={['geoObject.addon.editor']}
              options={{
                fillColor,
                strokeColor,
                strokeWidth: 1,
                strokeOpacity: 0.8,
                draggable: false,
                clickable: false,
              }}
              onGeometryChange={handleGeometryChange}
            />
          )}
        </Map>
      </YMaps>
    </div>
  );
}
