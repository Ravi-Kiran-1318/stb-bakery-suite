import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';
import MapPicker from '../../components/MapPicker';

const AddressesTab = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    pincode: '',
    isDefault: false,
    lat: null,
    lng: null
  });
  const [distanceKm, setDistanceKm] = useState(0);
  const { addToast } = useContext(ToastContext);
  
  const shopLat = parseFloat(import.meta.env.VITE_SHOP_LAT) || 13.6288;
  const shopLng = parseFloat(import.meta.env.VITE_SHOP_LNG) || 79.4192;

  const handleLocationSelect = useCallback((lat, lng, address, dist) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    setDistanceKm(dist);
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await axiosInstance.get('/users/addresses');
      setAddresses(data);
    } catch (error) {
      addToast('Failed to load addresses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const { data } = await axiosInstance.delete(`/users/addresses/${id}`);
      setAddresses(data);
      addToast('Address deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete address', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditClick = (addr) => {
    setFormData({
      type: addr.type,
      name: addr.name,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
      lat: addr.lat,
      lng: addr.lng
    });
    setEditingId(addr._id);
    setShowModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      return addToast('Please pin your location on the map.', 'error');
    }
    if (distanceKm > 10) {
      return addToast('Your location is outside our 10km delivery zone. Address cannot be saved.', 'error');
    }
    try {
      let responseData;
      if (editingId) {
        const { data } = await axiosInstance.put(`/users/addresses/${editingId}`, formData);
        responseData = data;
      } else {
        const { data } = await axiosInstance.post('/users/addresses', formData);
        responseData = data;
      }
      setAddresses(responseData);
      setShowModal(false);
      setEditingId(null);
      setFormData({
        type: 'Home', name: '', phone: '', addressLine1: '', addressLine2: '', city: 'Tirupati', state: 'Andhra Pradesh', pincode: '', isDefault: false, lat: null, lng: null
      });
      setDistanceKm(0);
      addToast(`Address ${editingId ? 'updated' : 'added'} successfully`, 'success');
    } catch (error) {
      addToast(`Failed to ${editingId ? 'update' : 'add'} address`, 'error');
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading addresses...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Saved Addresses</h2>
          <p className="text-gray-500 mt-1">Manage your delivery locations for faster checkout.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({
              type: 'Home', name: '', phone: '', addressLine1: '', addressLine2: '', city: 'Tirupati', state: 'Andhra Pradesh', pincode: '', isDefault: false, lat: null, lng: null
            });
            setShowModal(true);
          }} 
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New
        </button>
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pinpoint Location *</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-2">
                  <MapPicker shopLat={shopLat} shopLng={shopLng} onLocationSelect={handleLocationSelect} />
                </div>
                {distanceKm > 10 && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> Outside 10km delivery zone
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" name="phone" required pattern="[0-9]{10}" placeholder="10-digit number" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input type="text" name="addressLine1" required placeholder="Flat No, House No, Building" value={formData.addressLine1} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                <input type="text" name="addressLine2" placeholder="Landmark, Area, Street" value={formData.addressLine2} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input type="text" name="pincode" required pattern="[0-9]{6}" placeholder="6 digits" value={formData.pincode} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded" />
                <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-400 text-6xl mb-4">📍</div>
          <h3 className="text-xl font-medium text-gray-700">No saved addresses</h3>
          <p className="text-gray-500 mt-2">Add an address to speed up your checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div 
              key={addr._id} 
              className={`bg-white rounded-2xl p-6 shadow-sm border ${addr.isDefault ? 'border-amber-400' : 'border-gray-200'} relative`}
            >
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">
                  Default
                </span>
              )}
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                  {addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '💼' : '📍'}
                </div>
                <h3 className="font-bold text-lg text-gray-800">{addr.type}</h3>
              </div>

              <div className="space-y-1 text-gray-600 text-sm mb-6">
                <p className="font-semibold text-gray-800">{addr.name}</p>
                <p>{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>{addr.city}, {addr.state} {addr.pincode}</p>
                <p className="pt-2">📞 {addr.phone}</p>
              </div>

              <div className="flex space-x-3 border-t border-gray-100 pt-4">
                <button 
                  onClick={() => handleEditClick(addr)}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(addr._id)} 
                  className="flex-1 border border-red-100 text-red-600 hover:bg-red-50 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AddressesTab;
