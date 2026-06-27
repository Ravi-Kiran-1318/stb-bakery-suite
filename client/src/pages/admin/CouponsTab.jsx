import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import { toast } from 'react-hot-toast';

const CouponsTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    expiryDate: '',
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/coupons');
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = async (id) => {
    try {
      await axiosInstance.put(`/coupons/${id}/toggle`);
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await axiosInstance.delete(`/coupons/${id}`);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/coupons', formData);
      toast.success('Coupon created successfully');
      setShowModal(false);
      setFormData({ code: '', discountPercentage: '', expiryDate: '', isActive: true });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-800">Manage Promo Codes</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <span>+</span> New Coupon
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-semibold uppercase tracking-wider">Code</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Discount</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Uses</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Expiry</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
              <th className="p-4 font-semibold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No coupons found. Create one to get started!
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-sm border border-amber-200">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-green-600">{coupon.discountPercentage}% OFF</td>
                  <td className="p-4 text-gray-600">{coupon.usageCount}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleToggle(coupon._id)}
                      className={`px-3 py-1 text-xs font-bold rounded-full ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(coupon._id)}
                      className="text-red-500 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 p-2 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Create Promo Code</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code (e.g. WELCOME10)</label>
                <input 
                  type="text" 
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none uppercase font-bold"
                  placeholder="CODE"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 text-amber-500 focus:ring-amber-500 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Coupon is active immediately</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-md"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsTab;
