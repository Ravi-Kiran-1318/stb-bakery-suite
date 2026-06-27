import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';

const CustomOrdersTab = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useContext(ToastContext);

  const [formData, setFormData] = useState({
    description: '',
    referenceImageUrl: '',
    weight: 1,
    requestedDate: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get('/custom-cakes/my-requests');
      setRequests(data);
    } catch (error) {
      addToast('Failed to load custom cake requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post('/custom-cakes', formData);
      setRequests([data, ...requests]);
      setShowForm(false);
      setFormData({ description: '', referenceImageUrl: '', weight: 1, requestedDate: '' });
      addToast('Custom cake request submitted successfully!', 'success');
    } catch (error) {
      addToast('Failed to submit request', 'error');
    }
  };

  const handleAcceptQuote = async (id) => {
    try {
      await axiosInstance.put(`/custom-cakes/${id}/accept`);
      setRequests(requests.map(req => req._id === id ? { ...req, status: 'Accepted' } : req));
      addToast('Quote accepted! We will contact you for payment.', 'success');
    } catch (error) {
      addToast('Failed to accept quote', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending Review</span>;
      case 'Quoted': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Quote Received</span>;
      case 'Accepted': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Accepted</span>;
      case 'Rejected': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Declined</span>;
      case 'Completed': return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Completed</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading your requests...</div>;
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
          <h2 className="text-2xl font-bold text-gray-800">Custom Cake Requests</h2>
          <p className="text-gray-500 mt-1">Upload an image and request a quote for your dream cake.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            + Request Custom Cake
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h3 className="text-xl font-semibold mb-4">New Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe Your Cake *</label>
              <textarea 
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="E.g., A 2-tier superhero themed cake for a 5-year-old..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Image URL (Optional)</label>
                <input 
                  type="url"
                  name="referenceImageUrl"
                  value={formData.referenceImageUrl}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="https://example.com/cake-image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approximate Weight (kg) *</label>
                <input 
                  type="number"
                  name="weight"
                  required
                  min="0.5"
                  step="0.5"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Required By *</label>
              <input 
                type="date"
                name="requestedDate"
                required
                value={formData.requestedDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-400 text-6xl mb-4">🎂</div>
          <h3 className="text-xl font-medium text-gray-700">No requests yet</h3>
          <p className="text-gray-500 mt-2">Have a dream cake in mind? Get a custom quote from us.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
              {req.referenceImageUrl && (
                <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img src={req.referenceImageUrl} alt="Reference" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                </div>
              )}
              
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg text-gray-800">Custom Cake Request</h4>
                  {getStatusBadge(req.status)}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{req.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Weight:</span> <span className="font-medium">{req.weight} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Needed By:</span> <span className="font-medium">{new Date(req.requestedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {req.status === 'Quoted' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2">
                    <p className="text-sm text-blue-800 mb-2">
                      <span className="font-semibold">Bakery Admin:</span> We can make this for <span className="font-bold text-lg">₹{req.quotePrice}</span>.
                      {req.adminNotes && <span className="block mt-1 italic text-blue-700">"{req.adminNotes}"</span>}
                    </p>
                    <button 
                      onClick={() => handleAcceptQuote(req._id)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                      Accept Quote
                    </button>
                  </div>
                )}
                
                {req.status === 'Accepted' && (
                  <div className="text-sm text-green-700 font-medium bg-green-50 p-2 rounded inline-block mt-2">
                    Quote Accepted (₹{req.quotePrice}). We will contact you soon.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CustomOrdersTab;
