import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../../utils/axiosInstance';
import { ToastContext } from '../../../context/ToastContext';
import Loader from '../../../components/Loader';
import ErrorState from '../../../components/ErrorState';
import { formatCurrency } from '../../../utils/formatCurrency';

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
      const { data } = await axiosInstance.get(`/api/orders`, {
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
      await axiosInstance.patch(`/api/orders/${id}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
      addToast(`Order marked as ${newStatus}`, 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await axiosInstance.patch(`/api/orders/${orderToCancel}/cancel`, {
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-lg shadow-sm border border-border">
        <div className="flex gap-2">
          {['Today', 'This Week', 'All'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                range === r ? 'bg-accent text-white' : 'bg-surface text-dark hover:bg-border'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field max-w-[200px]"
          >
            <option value="All">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <input
            type="text"
            placeholder="Search name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-[250px]"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-border">
          <p className="text-muted">No orders found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-border rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                <div>
                  <span className="font-bold text-dark text-lg">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className="text-sm text-muted ml-3">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Info */}
                <div>
                  <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Customer</h4>
                  <p className="font-semibold text-dark">{order.customerInfo?.name || order.user?.name}</p>
                  <p className="text-sm">{order.customerInfo?.mobile}</p>
                  {order.user?.email && <p className="text-sm text-muted">{order.user.email}</p>}
                </div>

                {/* Delivery Info */}
                <div>
                  <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Delivery</h4>
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
                <div>
                  <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Items & Payment</h4>
                  <div className="max-h-32 overflow-y-auto mb-2 text-sm border-b border-border pb-2">
                    {order.orderItems?.map(item => (
                      <div key={item.product} className="flex justify-between mb-1">
                        <span>{item.qty}x {item.nameEN}</span>
                        <span>{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-dark mt-2">
                    <span>Total</span>
                    <span className="text-accent">{formatCurrency(order.totalPrice)}</span>
                  </div>
                  <div className="mt-2 text-sm flex justify-between">
                    <span>Method: {order.paymentMethod}</span>
                    <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.isPaid ? 'Paid ✅' : 'Pending ⏳'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              {order.status !== 'Cancelled' && (
                <div className="p-4 bg-surface border-t border-border flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Change Status:</label>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="input-field py-1"
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'Received' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'Preparing')} className="btn-primary py-1.5 text-sm">
                        Confirm (Preparing)
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'Ready')} className="btn-primary py-1.5 text-sm">
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'Out for Delivery' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'Delivered')} className="btn-primary py-1.5 text-sm">
                        Mark Delivered
                      </button>
                    )}
                    <button 
                      onClick={() => { setOrderToCancel(order._id); setCancelModalOpen(true); }}
                      className="btn-secondary py-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50"
                    >
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
