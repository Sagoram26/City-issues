import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons based on status
const createCustomIcon = (status) => {
  const colors = {
    open: '#f59e0b',      // warning yellow
    in_progress: '#3b82f6', // primary blue
    resolved: '#22c55e',   // success green
    closed: '#6b7280'      // gray
  };
  
  const color = colors[status] || colors.open;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Component to handle map center changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

// Component to handle click events for location picking
const LocationPicker = ({ onLocationSelect }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!onLocationSelect) return;
    
    const handleClick = (e) => {
      onLocationSelect({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);
  
  return null;
};

const IssueMap = ({ 
  issues = [], 
  center = [48.8566, 2.3522], // Default: Paris
  zoom = 12,
  height = '500px',
  onLocationSelect = null,
  selectedLocation = null,
  showPopups = true
}) => {
  const statusLabels = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Résolu',
    closed: 'Fermé'
  };

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={center} zoom={zoom} />
        
        {onLocationSelect && <LocationPicker onLocationSelect={onLocationSelect} />}
        
        {/* Selected location marker for location picker */}
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.latitude, selectedLocation.longitude]}
            icon={createCustomIcon('open')}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>Emplacement sélectionné</strong>
                <br />
                <small>
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Issue markers */}
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
            icon={createCustomIcon(issue.status)}
          >
            {showPopups && (
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{issue.title}</h4>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}>
                    {issue.description.substring(0, 100)}
                    {issue.description.length > 100 ? '...' : ''}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.5rem'
                  }}>
                    <span className={`badge badge-${issue.status}`}>
                      {statusLabels[issue.status]}
                    </span>
                    <Link 
                      to={`/issues/${issue.id}`}
                      style={{ fontSize: '0.875rem' }}
                    >
                      Voir détails →
                    </Link>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IssueMap;
