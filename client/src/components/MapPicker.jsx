import React, { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    const dist = haversine(shopLat, shopLng, customerPos[0], customerPos[1]);
    setDistance(dist);
    onLocationSelect(customerPos[0], customerPos[1], address, dist);
  }, [customerPos, address, shopLat, shopLng, onLocationSelect]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
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

  const isEligible = distance <= 10;

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for an area, street, or landmark..."
          className="input-field flex-grow"
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border shadow-sm z-0 relative">
        <MapContainer center={customerPos} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={customerPos} zoom={14} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[shopLat, shopLng]} icon={shopIcon}>
            <Popup>
              <b>Bakery Location</b><br/>Sri Tirupati Venkatachalapathy Bakery
            </Popup>
          </Marker>
          <Circle 
            center={[shopLat, shopLng]} 
            radius={10000} // 10km in meters
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
