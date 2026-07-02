import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { formatCurrency } from '../../utils/formatCurrency';

const PaymentsTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/orders`, {
        params: { search }
      });
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search]);

  const filteredOrders = orders.filter(o => {
    if (paymentStatusFilter === 'All') return true;
    if (paymentStatusFilter === 'Completed' && o.paymentStatus === 'Paid') return true;
    if (paymentStatusFilter === 'Pending' && (o.paymentStatus === 'Pending' || o.paymentStatus === 'Partial')) return true;
    return false;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Order Payments</h2>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 justify-between items-center">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
          {['All', 'Pending', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setPaymentStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                paymentStatusFilter === status 
                  ? 'bg-white shadow-sm text-amber-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <input 
            type="text"
            placeholder="Search order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm w-full transition-shadow"
          />
          <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center"><Loader /></div>
      ) : error ? (
        <div className="min-h-[40vh] flex items-center justify-center"><ErrorState message={error} onRetry={fetchPayments} /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white py-12 px-4 rounded-xl shadow-sm text-center border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-1">No payment records found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="bg-transparent md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Order Details</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Order Type</th>
                <th className="p-4 font-bold">Total Amount</th>
                <th className="p-4 font-bold md:text-center">Advance Paid</th>
                <th className="p-4 font-bold md:text-center">Due Amount</th>
                <th className="p-4 font-bold">Payment Status</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group text-sm">
              {filteredOrders.map((order, index) => {
                const total = order.totalAmount || 0;
                const advance = order.paymentMethod === 'Online' ? Math.ceil(total * 0.2) : 0;
                const due = order.paymentMethod === 'Online' ? total - advance : total;
                const isPaid = order.paymentStatus === 'Paid';
                const isFirst = index === 0;

                return (
                  <tr 
                    key={order._id} 
                    className={`block md:table-row rounded-2xl md:rounded-none md:shadow-none md:border-0 md:border-b md:border-gray-100 mb-6 md:mb-0 transition-colors relative overflow-hidden md:overflow-visible ${
                      isPaid
                        ? 'bg-blue-50/20 border-2 border-blue-400 shadow-md shadow-blue-500/10 md:bg-blue-50 md:border-0 md:border-b md:border-b-blue-100 hover:bg-blue-100/50'
                        : isFirst 
                          ? 'bg-amber-50/30 border-2 border-amber-300 shadow-md ring-4 ring-amber-50 md:ring-0 md:bg-white md:border-b hover:bg-amber-50/50' 
                          : 'bg-white border border-gray-200 shadow-sm hover:bg-gray-50/50'
                    }`}
                  >
                    
                    <td className={`block md:table-cell p-4 border-b border-gray-50 md:border-none relative md:static ${isPaid ? 'pt-8' : ''}`}>
                      {isPaid && (
                        <div className="md:hidden absolute top-0 left-0 bg-blue-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-br-2xl flex items-center gap-1 shadow-sm z-10">
                          ✅ COMPLETED
                        </div>
                      )}
                      <div className="flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-xs text-gray-400 uppercase">Order</span>
                        <div className="text-right md:text-left">
                          <div className="font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</div>
                          <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                          {isPaid && (
                            <div className="hidden md:flex mt-1 text-[10px] bg-blue-100 text-blue-700 w-max px-2 py-0.5 rounded uppercase font-bold items-center gap-1">
                              ✅ Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="block md:table-cell p-4 border-b border-gray-50 md:border-none">
                      <div className="flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-xs text-gray-400 uppercase">Customer</span>
                        <div className="text-right md:text-left">
                          <div className="font-semibold text-gray-800">{order.customerInfo?.name || order.user?.name}</div>
                          <div className="text-xs text-gray-500">{order.customerInfo?.mobile}</div>
                        </div>
                      </div>
                    </td>

                    <td className="block md:table-cell p-4 border-b border-gray-50 md:border-none">
                      <div className="flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-xs text-gray-400 uppercase">Type</span>
                        <div className="text-right md:text-left">
                          <div className="font-semibold text-gray-900 capitalize">{order.deliveryType || 'N/A'}</div>
                          {order.deliveryType === 'Delivery' && (
                            <div className="text-[10px] text-amber-600 font-bold mt-0.5 md:mt-1">
                              Fee: {formatCurrency(total - (order.items || order.orderItems || []).reduce((acc, item) => acc + (item.price * item.qty), 0))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="block md:table-cell p-4 border-b border-gray-50 md:border-none">
                      <div className="flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-xs text-gray-400 uppercase">Total</span>
                        <div className="font-black text-gray-900">{formatCurrency(total)}</div>
                      </div>
                    </td>

                    <td className="block md:table-cell p-4 border-b border-gray-50 md:border-none md:text-center">
                      <div className="flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-xs text-gray-400 uppercase">Advance</span>
                        <div>
                          {advance > 0 ? (
                            <span className="text-green-700 font-semibold bg-green-50 px-2 py-1 rounded">
                              {formatCurrency(advance)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="block md:table-cell p-4 border-b border-gray-50 md:border-none md:text-center">
                      <div className="flex justify-between items-center md:block">
                        <span className="md:hidden font-bold text-xs text-gray-400 uppercase">Due Amount</span>
                        <div>
                          {due > 0 ? (
                            <span className={`${order.paymentStatus === 'Paid' ? 'text-gray-400 font-semibold' : 'text-red-700 font-bold bg-red-50 px-2 py-1 rounded'}`}>
                              {formatCurrency(due)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="block md:table-cell p-4 bg-gray-50/50 md:bg-transparent rounded-b-2xl md:rounded-none">
                      <div className="flex justify-between items-start md:block">
                        <span className="md:hidden font-bold text-xs text-gray-400 uppercase mt-1">Status</span>
                        <div className="flex flex-col gap-1.5 items-end md:items-start text-right md:text-left">
                          {order.paymentStatus === 'Paid' ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Paid ✅</span>
                          ) : order.paymentStatus === 'Partial' ? (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Partial ✅</span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">Pending ⏳</span>
                          )}
                          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                            Initial: <span className="text-gray-700">{order.paymentMethod === 'Online' ? 'Online (Adv)' : 'COD'}</span>
                          </div>
                          {order.deliveryPaymentMethod && (
                            <div className="text-[10px] text-blue-600 uppercase font-black tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                              Final: {order.deliveryPaymentMethod}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
