import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

const CustomOrdersAdminTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useContext(ToastContext);

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/custom-cakes');
      setRequests(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load custom cake requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/custom-cakes/${id}`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
      addToast(`Status updated to ${status}`, 'success');
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const submitQuote = async (e) => {
    e.preventDefault();
    if (!quotePrice) {
      addToast('Please provide a quote price', 'error');
      return;
    }
    
    try {
      await axiosInstance.put(`/custom-cakes/${selectedRequest._id}`, {
        status: 'Quoted',
        quotePrice: Number(quotePrice),
        adminNotes
      });
      setRequests((prev) =>
        prev.map((r) =>
          r._id === selectedRequest._id
            ? { ...r, status: 'Quoted', quotePrice: Number(quotePrice), adminNotes }
            : r
        )
      );
      addToast('Quote sent successfully', 'success');
      setQuoteModalOpen(false);
      setSelectedRequest(null);
      setQuotePrice('');
      setAdminNotes('');
    } catch (error) {
      addToast('Failed to send quote', 'error');
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={fetchRequests} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Custom Cake Requests</h2>
          <p className="text-sm text-slate-500 mt-1">Review and provide quotes for customer requests.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
              <th className="px-6 py-4 font-bold tracking-wider">Details</th>
              <th className="px-6 py-4 font-bold tracking-wider">Image</th>
              <th className="px-6 py-4 font-bold tracking-wider">Needed By</th>
              <th className="px-6 py-4 font-bold tracking-wider">Status</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl mb-3">🎂</span>
                    <p>No custom cake requests found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 align-top">
                    <div className="font-semibold text-slate-800">{req.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{req.user?.mobile}</div>
                  </td>
                  <td className="px-6 py-4 align-top max-w-xs">
                    <p className="text-slate-800 font-medium mb-1 line-clamp-2">{req.description}</p>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div>Weight: {req.weight} kg</div>
                      {req.flavour && <div>Flavour: {req.flavour}</div>}
                      {req.shape && <div>Shape: {req.shape}</div>}
                      {req.color && <div>Color: {req.color}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    {req.referenceImageUrl ? (
                      <a href={req.referenceImageUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={req.referenceImageUrl}
                          alt="Reference"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity cursor-pointer"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top whitespace-nowrap">
                    <div className="font-medium text-slate-700">
                      {new Date(req.requestedDate).toLocaleDateString()}
                    </div>
                    {req.requestedTime && <div className="text-xs text-slate-500">{req.requestedTime}</div>}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'Quoted' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        req.status === 'Completed' ? 'bg-slate-100 text-slate-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {req.status}
                    </span>
                    {req.quotePrice && (
                      <div className="text-xs font-medium text-slate-600 mt-1">₹{req.quotePrice}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top text-right space-x-2">
                    {req.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setQuotePrice('');
                          setAdminNotes('');
                          setQuoteModalOpen(true);
                        }}
                        className="text-amber-600 hover:text-amber-700 font-medium text-sm bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded transition-colors"
                      >
                        Provide Quote
                      </button>
                    )}
                    {(req.status === 'Pending' || req.status === 'Quoted') && (
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                        className="text-red-600 hover:text-red-700 font-medium text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Provide Quote</h3>
              
              <form onSubmit={submitQuote} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quote Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="Enter price..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows="3"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                    placeholder="Any message for the customer..."
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteModalOpen(false);
                      setSelectedRequest(null);
                    }}
                    className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-sm"
                  >
                    Send Quote
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CustomOrdersAdminTab;
