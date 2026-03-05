// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: components/IssueMap.js
// Composant carte Leaflet (OpenStreetMap) pour afficher les signalements.
// Supporte deux modes :
// - Affichage : montre les markers des issues avec popups
// - Sélection : permet de cliquer pour choisir un emplacement
// ═══════════════════════════════════════════════════════════════════════════

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// --- Correction d'un bug Leaflet avec les icônes par défaut dans React ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// --- Crée une icône de marker colorée selon le statut ---
const createCustomIcon = (status) => {
  const colors = {
    open: '#f59e0b',      // Jaune : nouveau signalement
    in_progress: '#3b82f6', // Bleu : en cours de traitement
    resolved: '#22c55e',   // Vert : résolu
    closed: '#6b7280'      // Gris : fermé
  };
  
  const color = colors[status] || colors.open;
  
  // Crée un marker en forme de goutte coloré
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

// --- Sous-composant : change le centre de la carte ---
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && map && map.getContainer()) {
      // S'assurer que la carte est prête avant de changer la vue
      try {
        map.setView(center, zoom, { animate: false });
      } catch (e) {
        // Ignorer les erreurs si la carte n'est pas prête
        console.warn('Map view change failed:', e);
      }
    }
  }, [center, zoom, map]);
  
  return null;
};

// --- Sous-composant : gère le clic pour sélectionner un emplacement ---
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

// --- COMPOSANT PRINCIPAL : IssueMap ---
// Props:
// - issues: liste des signalements à afficher
// - center: [lat, lng] centre de la carte (défaut: Paris)
// - zoom: niveau de zoom (défaut: 12)
// - height: hauteur de la carte
// - onLocationSelect: callback pour le mode sélection (clic sur carte)
// - selectedLocation: emplacement sélectionné (en mode sélection)
// - showPopups: afficher les popups sur les markers
const IssueMap = ({ 
  issues = [], 
  center = [48.8566, 2.3522], // Défaut: Paris
  zoom = 12,
  height = '500px',
  onLocationSelect = null,      // Si défini, active le mode sélection
  selectedLocation = null,
  showPopups = true
}) => {
  // Labels pour les statuts (affichés dans les popups)
  const statusLabels = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Résolu',
    closed: 'Fermé'
  };

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        key="main-map"
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        whenReady={(map) => {
          // S'assurer que la carte est correctement initialisée
          setTimeout(() => {
            map.target.invalidateSize();
          }, 100);
        }}
      >
        {/* Tuiles OpenStreetMap (fond de carte gratuit) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Mode sélection : active le clic sur la carte */}
        {onLocationSelect && <LocationPicker onLocationSelect={onLocationSelect} />}
        
        {/* Marker pour l'emplacement sélectionné (mode sélection) */}
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
        
        {/* Markers des signalements existants */}
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
