import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { haversine } from '../utils/haversine';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map centering programmatically
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map, zoom]);
  return null;
};

// Component to handle dragging customer marker
const DraggableMarker = ({ position, setPosition, setAddress }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    },
  });

  const markerRef = useRef(null);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      if (res.data && res.data.display_name) {
        setAddress(res.data.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    }
  };

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
        reverseGeocode(newPos.lat, newPos.lng);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup minWidth={90}>Your Delivery Location</Popup>
    </Marker>
  );
};

const MapPicker = ({ shopLat, shopLng, onLocationSelect }) => {
  const [customerPos, setCustomerPos] = useState([shopLat, shopLng]);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [distance, setDistance] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const dist = haversine(shopLat, shopLng, customerPos[0], customerPos[1]);
    setDistance(dist);
    onLocationSelect(customerPos[0], customerPos[1], address, dist);
  }, [customerPos, address, shopLat, shopLng, onLocationSelect]);

  // Debounced search for suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery || searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        // Create a bounding box roughly 10km around the shop (10km is ~0.09 degrees)
        const left = shopLng - 0.09;
        const top = shopLat + 0.09;
        const right = shopLng + 0.09;
        const bottom = shopLat - 0.09;
        const viewbox = `${left},${top},${right},${bottom}`;
        
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1&viewbox=${viewbox}&bounded=1`);
        if (res.data) {
          setSuggestions(res.data);
        }
      } catch (error) {
        console.error("Suggestion fetch failed", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 800);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectSuggestion = (item) => {
    const newPos = [parseFloat(item.lat), parseFloat(item.lon)];
    setCustomerPos(newPos);
    setAddress(item.display_name);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const left = shopLng - 0.09;
      const top = shopLat + 0.09;
      const right = shopLng + 0.09;
      const bottom = shopLat - 0.09;
      const viewbox = `${left},${top},${right},${bottom}`;

      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&viewbox=${viewbox}&bounded=1`);
      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setCustomerPos(newPos);
        setAddress(display_name);
      } else {
        alert("Location not found. Try a different query.");
      }
    } catch (error) {
      console.error("Geocoding failed", error);
    }
  };

  const isEligible = distance <= 5;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative z-50">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            placeholder="Search for an area, street, or landmark..."
            className="input-field flex-grow"
          />
          <button type="button" onClick={handleSearch} className="btn-primary shrink-0">Search</button>
        </div>
        
        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-[1000]">
            {suggestions.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => handleSelectSuggestion(item)}
                className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm text-gray-700 transition-colors"
              >
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border shadow-sm z-0 relative">
        <MapContainer center={customerPos} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={customerPos} zoom={14} />
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          />
          <Marker position={[shopLat, shopLng]} icon={shopIcon}>
            <Popup>
              <b>Bakery Location</b><br/>Sri Tirupati Venkatachalapathy Bakery
            </Popup>
          </Marker>
          <Circle 
            center={[shopLat, shopLng]} 
            radius={5000} // 5km in meters
            pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.08 }} 
          />
          <DraggableMarker position={customerPos} setPosition={setCustomerPos} setAddress={setAddress} />
        </MapContainer>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-4 rounded-lg border border-border">
        <div className="flex-grow">
          <p className="text-sm font-medium text-muted mb-1">Selected Address:</p>
          <p className="text-sm text-dark font-semibold">{address || 'Drag the blue pin to your exact location'}</p>
        </div>
        
        <div className="shrink-0 flex items-center">
          {isEligible ? (
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1">
              ✅ Eligible for delivery — ₹50 fee ({distance.toFixed(1)} km)
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1">
              🏪 Beyond range — Pickup only ({distance.toFixed(1)} km)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
