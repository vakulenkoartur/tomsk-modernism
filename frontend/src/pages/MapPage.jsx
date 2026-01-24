import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { YMaps, Map, Polygon } from '@pbe/react-yandex-maps';
import { useObjects } from '../hooks/useObjects';
import { useMosaics } from '../hooks/useMosaics';
import { API_URL } from '../api/client';

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const { objects } = useObjects();
  const { mosaics } = useMosaics();

  const items = useMemo(() => {
    const objItems = (objects || [])
      .filter((o) => Array.isArray(o.polygonCoords) && o.polygonCoords.length >= 3)
      .map((o) => ({ ...o, type: 'object' }));
    const mosaicItems = (mosaics || [])
      .filter((m) => Array.isArray(m.polygonCoords) && m.polygonCoords.length >= 3)
      .map((m) => ({ ...m, type: 'mosaic' }));
    return [...objItems, ...mosaicItems];
  }, [objects, mosaics]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusId =
      params.get('focus') || location.state?.focusItemId || location.state?.focusObjectId;
    const focusType = location.state?.focusItemType;
    if (!focusId || items.length === 0) return;
    const match = items.find((item) => {
      const sameId = String(item.id) === String(focusId);
      if (!sameId) return false;
      if (!focusType) return true;
      return item.type === focusType;
    });
    if (match) setSelected(match);
  }, [location.search, location.state, items]);

  useEffect(() => {
    if (!selected) return;
    if (!mapReady) return;
    const center =
      selected.lat && selected.lng
        ? [Number(selected.lat), Number(selected.lng)]
        : getPolygonCenter(selected.polygonCoords);
    if (mapRef.current && center) {
      mapRef.current.setCenter(center, 16, {
        duration: 500,
        checkZoomRange: true,
      });
    }
  }, [mapReady, selected]);

  const getPolygonCenter = (coords) => {
    if (!Array.isArray(coords) || coords.length === 0) return null;
    const sum = coords.reduce(
      (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
      [0, 0]
    );
    return [sum[0] / coords.length, sum[1] / coords.length];
  };

  const handlePolygonClick = (item) => {
    if (!item.hasCard) return;
    setSelected(item);
    const center = item.lat && item.lng ? [item.lat, item.lng] : getPolygonCenter(item.polygonCoords);
    if (mapRef.current && center) {
      mapRef.current.setCenter(center, 16, {
        duration: 500,
        checkZoomRange: true,
      });
    }
  };

  const getStrokeColor = (item) => {
    if (item.hasCard) return '#ff6b35';
    if (item.isUnique) return '#3a7bff';
    return '#9aa3ab';
  };

  const getFillColor = (item) => {
    if (item.hasCard) return 'rgba(255, 107, 53, 0.75)';
    if (item.isUnique) return 'rgba(58, 124, 255, 0.75)';
    return 'rgba(154, 163, 171, 0.35)';
  };

  const getTitle = (item) => {
    if (item.type === 'mosaic') return item.name || item.location;
    return item.name || item.address;
  };

  const getSubtitle = (item) => {
    if (item.type === 'mosaic') return item.location || '';
    return item.address || '';
  };

  const getDetailsPath = (item) => {
    if (item.type === 'mosaic') return `/mosaics/${item.id}`;
    return `/objects/${item.id}`;
  };

  const imageUrl = selected?.image
    ? selected.image.startsWith('http')
      ? selected.image
      : `${API_URL}${selected.image}`
    : null;

  return (
    <>
      <div className="map-container">
        <div className="map-fullscreen">
          <YMaps query={{ apikey: YANDEX_API_KEY }}>
            <Map
              instanceRef={mapRef}
              defaultState={{
                center: [56.4866, 84.9719],
                zoom: 14,
              }}
              width="100%"
              height="100%"
              options={{
                suppressMapOpenBlock: true,
                controls: [],
              }}
              onLoad={() => setMapReady(true)}
            >
              {items.map((item) => (
                <Polygon
                  key={`${item.type}-${item.id}`}
                  geometry={[item.polygonCoords]}
                  options={{
                    fillColor: getFillColor(item),
                    strokeColor: getStrokeColor(item),
                    strokeWidth: 2,
                    strokeOpacity: 0.9,
                    cursor: item.hasCard ? 'pointer' : 'default',
                    clickable: !!item.hasCard,
                    pane: 'areas',
                  }}
                  onClick={() => handlePolygonClick(item)}
                />
              ))}
            </Map>
          </YMaps>
        </div>

        {selected && (
          <div className="map-object-panel">
            <div className="map-object-card">
              <button className="map-close-btn" onClick={() => setSelected(null)}>
                ×
              </button>
              <div className="map-object-image">
                {imageUrl ? (
                  <img src={imageUrl} alt={getTitle(selected)} />
                ) : (
                  <div className="image-placeholder">Нет изображения</div>
                )}
              </div>
              <div className="map-object-info">
                <h3>{getTitle(selected)}</h3>
                {getSubtitle(selected) && <p className="address">{getSubtitle(selected)}</p>}
                {selected.desc && <p className="desc">{selected.desc}</p>}
                <button className="btn btn-primary" onClick={() => navigate(getDetailsPath(selected))}>
                  Подробнее
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
