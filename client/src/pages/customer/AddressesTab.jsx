import { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';
import MapPicker from '../../components/MapPicker';
import { useI18n } from '../../context/I18nContext';

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
  const { t } = useI18n();
  
  const shopLat = parseFloat(import.meta.env.VITE_SHOP_LAT) || 17.2852909;
  const shopLng = parseFloat(import.meta.env.VITE_SHOP_LNG) || 82.105785;

  const handleLocationSelect = useCallback((lat, lng, address, dist) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    setDistanceKm(dist);
  }, []);

  useEffect(() => {
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

    fetchAddresses();
  }, [addToast]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('AddressesTab.DeleteConfirm', null, 'Are you sure you want to delete this address?'))) return;
    try {
      const { data } = await axiosInstance.delete(`/users/addresses/${id}`);
      setAddresses(data);
      addToast(t('AddressesTab.DeleteSuccess', null, 'Address deleted successfully'), 'success');
    } catch (error) {
      addToast(t('AddressesTab.DeleteFailed', null, 'Failed to delete address'), 'error');
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
      return addToast(t('AddressesTab.PinRequired', null, 'Please pin your location on the map.'), 'error');
    }
    if (distanceKm > 10) {
      return addToast(t('AddressesTab.OutsideZone', null, 'Your location is outside our 10km delivery zone. Address cannot be saved.'), 'error');
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
      addToast(t('AddressesTab.SaveSuccess', { action: editingId ? 'updated' : 'added' }, `Address ${editingId ? 'updated' : 'added'} successfully`), 'success');
    } catch (error) {
      addToast(t('AddressesTab.SaveFailed', { action: editingId ? 'update' : 'add' }, `Failed to ${editingId ? 'update' : 'add'} address`), 'error');
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">{t('AddressesTab.Loading', null, 'Loading addresses...')}</div>;
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
          <h2 className="text-2xl font-bold text-gray-800">{t('AddressesTab.Title', null, 'Saved Addresses')}</h2>
          <p className="text-gray-500 mt-1">{t('AddressesTab.Subtitle', null, 'Manage your delivery locations for faster checkout.')}</p>
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
          {t('AddressesTab.AddNew', null, 'Add New')}
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">{editingId ? t('AddressesTab.EditTitle', null, 'Edit Address') : t('AddressesTab.AddTitle', null, 'Add New Address')}</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('AddressesTab.PinpointLbl', null, 'Pinpoint Location *')}</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-2">
                  <MapPicker shopLat={shopLat} shopLng={shopLng} onLocationSelect={handleLocationSelect} />
                </div>
                {distanceKm > 10 && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> {t('AddressesTab.OutsideZoneWarn', null, 'Outside 10km delivery zone')}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('AddressesTab.TypeLbl', null, 'Type *')}</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="Home">{t('AddressesTab.Home', null, 'Home')}</option>
                    <option value="Work">{t('AddressesTab.Work', null, 'Work')}</option>
                    <option value="Other">{t('AddressesTab.Other', null, 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('AddressesTab.NameLbl', null, 'Full Name *')}</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('AddressesTab.PhoneLbl', null, 'Phone Number *')}</label>
                <input type="tel" name="phone" required pattern="[0-9]{10}" placeholder={t('AddressesTab.PhonePh', null, '10-digit number')} value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('AddressesTab.Addr1Lbl', null, 'Address Line 1 *')}</label>
                <input type="text" name="addressLine1" required placeholder={t('AddressesTab.Addr1Ph', null, 'Flat No, House No, Building')} value={formData.addressLine1} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('AddressesTab.Addr2Lbl', null, 'Address Line 2 (Optional)')}</label>
                <input type="text" name="addressLine2" placeholder={t('AddressesTab.Addr2Ph', null, 'Landmark, Area, Street')} value={formData.addressLine2} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('AddressesTab.CityLbl', null, 'City *')}</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('AddressesTab.StateLbl', null, 'State *')}</label>
                  <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('AddressesTab.PinLbl', null, 'Pincode *')}</label>
                  <input type="text" name="pincode" required pattern="[0-9]{6}" placeholder={t('AddressesTab.PinPh', null, '6 digits')} value={formData.pincode} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded" />
                <label htmlFor="isDefault" className="text-sm text-gray-700">{t('AddressesTab.SetDefaultLbl', null, 'Set as default address')}</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  {t('AddressesTab.Cancel', null, 'Cancel')}
                </button>
                <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                  {editingId ? t('AddressesTab.UpdateBtn', null, 'Update Address') : t('AddressesTab.SaveBtn', null, 'Save Address')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-400 text-6xl mb-4">📍</div>
          <h3 className="text-xl font-medium text-gray-700">{t('AddressesTab.NoAddresses', null, 'No saved addresses')}</h3>
          <p className="text-gray-500 mt-2">{t('AddressesTab.NoAddressesDesc', null, 'Add an address to speed up your checkout.')}</p>
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
                  {t('AddressesTab.Default', null, 'Default')}
                </span>
              )}
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                  {addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '💼' : '📍'}
                </div>
                <h3 className="font-bold text-lg text-gray-800">{addr.type === 'Home' ? t('AddressesTab.Home', null, 'Home') : addr.type === 'Work' ? t('AddressesTab.Work', null, 'Work') : t('AddressesTab.Other', null, 'Other')}</h3>
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
                  {t('AddressesTab.Edit', null, 'Edit')}
                </button>
                <button 
                  onClick={() => handleDelete(addr._id)} 
                  className="flex-1 border border-red-100 text-red-600 hover:bg-red-50 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  {t('AddressesTab.Delete', null, 'Delete')}
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
