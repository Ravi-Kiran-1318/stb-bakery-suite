import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { formatCurrency } from '../../utils/formatCurrency';

const ORDER_STEPS = ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useContext(ToastContext);

  // Filters
  const [range, setRange] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/orders`, {
        params: { range, status: statusFilter, search }
      });
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [range, statusFilter, search]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axiosInstance.patch(`/orders/${id}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
      addToast(`Order marked as ${newStatus}`, 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await axiosInstance.patch(`/orders/${orderToCancel}/cancel`, {
        reason: cancelReason,
        cancelledBy: 'admin'
      });
      setOrders(orders.map(o => o._id === orderToCancel ? { ...o, status: 'Cancelled', cancelReason } : o));
      addToast('Order cancelled successfully', 'success');
      setCancelModalOpen(false);
      setOrderToCancel(null);
      setCancelReason('');
    } catch (err) {
      addToast('Failed to cancel order', 'error');
    }
  };

  const statusOptions = ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received': return 'bg-blue-100 text-blue-800';
      case 'Preparing': return 'bg-purple-100 text-purple-800';
      case 'Ready': return 'bg-amber-100 text-amber-800';
      case 'Out for Delivery': return 'bg-orange-100 text-orange-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-1 p-1">
          {['Today', 'This Week', 'All'].map(r => (
            <button 
              key={r}
              onClick={() => setRange(r)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors ${
                range === r 
                  ? 'bg-amber-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        
        <div className="flex-1 flex gap-4 ml-auto justify-end w-full md:w-auto">
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-6 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold shadow-sm w-48 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          
          <div className="relative">
            <input 
              type="text"
              placeholder="Search name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-6 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm w-64 shadow-sm"
            />
            <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center"><Loader /></div>
      ) : error ? (
        <div className="min-h-[50vh] flex items-center justify-center"><ErrorState message={error} onRetry={fetchOrders} /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white py-16 px-4 rounded-lg shadow-sm text-center border border-border">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-dark mb-2">No orders received yet.</h3>
          <p className="text-muted">Share your shop link to start getting orders!</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <span className="font-bold text-gray-900 text-lg">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className="text-sm text-gray-500 ml-3">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Customer Info */}
                <div className="p-6">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Customer
                  </h4>
                  <p className="font-semibold text-dark">{order.customerInfo?.name || order.user?.name}</p>
                  <p className="text-sm">{order.customerInfo?.mobile}</p>
                  {order.user?.email && <p className="text-sm text-muted">{order.user.email}</p>}
                </div>

                {/* Delivery Info */}
                <div className="p-6">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    Delivery
                  </h4>
                  <p className="text-sm capitalize font-semibold mb-1">Type: {order.deliveryType}</p>
                  {order.deliveryType === 'delivery' && (
                    <>
                      <p className="text-sm text-muted line-clamp-2">{order.shippingAddress?.address}</p>
                      <div className="mt-2">
                        {order.shippingAddress?.distanceKm <= 10 ? (
                          <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded flex items-center w-max gap-1">
                            ✅ Deliverable ({order.shippingAddress?.distanceKm} km)
                          </span>
                        ) : (
                          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded flex items-center w-max gap-1">
                            🏪 Pickup Only ({order.shippingAddress?.distanceKm} km)
                          </span>
                        )}
                      </div>
                    </>
                  )}
                  {order.requestedDate && (
                    <p className="text-sm mt-2"><span className="font-semibold">Requested:</span> {new Date(order.requestedDate).toLocaleDateString()} {order.requestedTime}</p>
                  )}
                </div>

                {/* Items & Payment */}
                <div className="p-6">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                    Items & Payment
                  </h4>
                  <div className="max-h-32 overflow-y-auto mb-2 text-sm border-b border-border pb-2">
                    {order.orderItems?.map(item => (
                      <div key={item.product} className="flex justify-between mb-1 gap-2">
                        <span className="truncate flex-1">{item.qty}x {item.nameEN}</span>
                        <span className="whitespace-nowrap font-medium">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-dark mt-2 pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-accent">{formatCurrency(order.totalAmount || 0)}</span>
                  </div>
                  {order.paymentStatus === 'Partial' && (
                    <div className="mt-2 flex flex-col items-end text-[10px] sm:text-xs font-semibold gap-1">
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Advance Paid: {formatCurrency(Math.ceil((order.totalAmount || 0) * 0.2))}
                      </span>
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        Due on Delivery: {formatCurrency((order.totalAmount || 0) - Math.ceil((order.totalAmount || 0) * 0.2))}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 text-sm flex justify-between">
                    <span>Method: {order.paymentMethod}</span>
                    <span className={`font-semibold ${order.paymentStatus === 'Paid' || order.paymentStatus === 'Partial' ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.paymentStatus === 'Paid' ? 'Paid ✅' : order.paymentStatus === 'Partial' ? 'Partial ✅' : 'Pending ⏳'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Tracker */}
              <div className="px-6 py-4 border-t border-border">
                {order.status === 'Cancelled' ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
                    <span className="text-xl">❌</span>
                    <div>
                      <p className="font-bold">Order Cancelled</p>
                      <p className="text-sm opacity-90">{order.cancelReason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-2 mb-4">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
                      <div 
                        style={{ width: `${(ORDER_STEPS.indexOf(order.status) / (ORDER_STEPS.length - 1)) * 100}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] sm:text-xs font-semibold text-gray-500">
                      {ORDER_STEPS.map((step, idx) => {
                        const currentStepIndex = ORDER_STEPS.indexOf(order.status);
                        return (
                          <div key={step} className={`text-center w-1/5 px-0.5 ${idx <= currentStepIndex ? 'text-amber-600' : ''}`}>
                            <div className={`w-4 h-4 mx-auto rounded-full mb-1 transition-all duration-500 border-2 ${
                              idx < currentStepIndex ? 'bg-amber-500 border-amber-500 flex items-center justify-center' : 
                              idx === currentStepIndex ? 'bg-white border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] ring-4 ring-amber-100 scale-125' : 
                              'bg-gray-200 border-gray-300'
                            }`}>
                              {idx < currentStepIndex && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                            </div>
                            <span className="block leading-tight">{step.replace('Out for Delivery', 'Out for Del.')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              {order.status !== 'Cancelled' && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-bold text-gray-700">Change Status:</label>
                    <div className="relative">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold cursor-pointer text-sm"
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'Received' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'Preparing')} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-4 rounded-lg shadow transition-colors text-sm">
                        Confirm (Preparing)
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'Ready')} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-4 rounded-lg shadow transition-colors text-sm">
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'Out for Delivery')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded-lg shadow transition-colors text-sm">
                        Send Out for Delivery
                      </button>
                    )}
                    {order.status === 'Out for Delivery' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'Delivered')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-4 rounded-lg shadow transition-colors text-sm">
                        Mark Delivered
                      </button>
                    )}
                    <button 
                      onClick={() => { setOrderToCancel(order._id); setCancelModalOpen(true); }}
                      className="flex items-center gap-2 py-1.5 px-4 text-sm font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors bg-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
            <p className="text-muted mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <textarea
              className="input-field mb-4 h-24"
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setCancelModalOpen(false)} className="btn-secondary">Close</button>
              <button onClick={handleCancelOrder} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
