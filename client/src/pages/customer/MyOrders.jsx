import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { formatCurrency } from '../../utils/formatCurrency';
import { SocketContext } from '../../context/SocketContext';
import jsPDF from 'jspdf';
import WhatsAppButton from '../../components/WhatsAppButton';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

const ORDER_STEPS = ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axiosInstance.get('/orders/my');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setError(err.response?.data?.message || 'Failed to fetch your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleStatusUpdate = (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    };

    if (socket) {
      socket.on('order_status_update', handleStatusUpdate);

      return () => {
        socket.off('order_status_update', handleStatusUpdate);
      };
    }
  }, [socket]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Cancel this order? This cannot be undone.')) {
      try {
        const { data } = await axiosInstance.patch(`/orders/${orderId}/cancel`, {
          reason: 'Cancelled by customer',
          cancelledBy: 'customer'
        });
        setOrders(prev => prev.map(o => o._id === data._id ? data : o));
      } catch (error) {
        alert('Failed to cancel order: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const generateReceipt = (order) => {
    const doc = new jsPDF();
    const shortOrderId = order._id.toString().slice(-6).toUpperCase();
    
    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Sri Tirupati Venkatachalapathy Bakery', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Tirupati, Andhra Pradesh', 105, 28, { align: 'center' });
    doc.text(`Phone: +91 ${import.meta.env.VITE_SHOP_WHATSAPP || '0000000000'}`, 105, 34, { align: 'center' });
    
    doc.line(20, 40, 190, 40); // Divider

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER RECEIPT', 105, 50, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: #${shortOrderId}`, 20, 65);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 20, 72);
    
    doc.text(`Customer: ${order.customerInfo?.name || 'Customer'}`, 130, 65);
    doc.text(`Mobile: ${order.customerInfo?.mobile || 'N/A'}`, 130, 72);
    
    // Table Header
    let y = 85;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Item Name', 22, y + 7);
    doc.text('Qty', 110, y + 7);
    doc.text('Unit Price', 135, y + 7);
    doc.text('Total', 170, y + 7);
    doc.rect(20, y, 170, 10); // Header border
    
    // Table Body
    y += 10;
    doc.setFont('helvetica', 'normal');
    order.items.forEach(item => {
      const name = item.nameEN || item.name;
      const lineTotal = item.price * item.qty;
      
      doc.rect(20, y, 170, 10);
      doc.text(name, 22, y + 7);
      doc.text(item.qty.toString(), 110, y + 7);
      doc.text(`Rs ${item.price}`, 135, y + 7);
      doc.text(`Rs ${lineTotal}`, 170, y + 7);
      y += 10;
    });
    
    // Totals
    y += 5;
    const subtotal = order.totalAmount - (order.deliveryType === 'Delivery' ? 50 : 0);
    doc.text(`Subtotal:`, 135, y + 5);
    doc.text(`Rs ${subtotal}`, 170, y + 5);
    
    if (order.deliveryType === 'Delivery') {
      y += 8;
      doc.text(`Delivery Fee:`, 135, y + 5);
      doc.text(`Rs 50`, 170, y + 5);
    }
    
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount:`, 135, y + 5);
    doc.text(`Rs ${order.totalAmount}`, 170, y + 5);
    doc.setFont('helvetica', 'normal');
    
    // Delivery & Payment info
    y += 20;
    doc.text(`Type: ${order.deliveryType}`, 20, y);
    if (order.deliveryType === 'Delivery' && order.location) {
      doc.text(`Address: ${order.location.address}`, 20, y + 7);
    } else {
      doc.text(`Pickup from shop`, 20, y + 7);
    }
    doc.text(`Requested Date: ${new Date(order.requestedDate).toLocaleString()}`, 20, y + 14);
    
    const paymentText = order.paymentMethod === 'Online' ? 'Online (Advance Paid)' : 'Cash on Delivery';
    doc.text(`Payment: ${paymentText}`, 20, y + 21);
    
    doc.line(20, y + 30, 190, y + 30);
    
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your order! 🎂 Visit us again.', 105, y + 40, { align: 'center' });
    
    doc.save(`Receipt_${shortOrderId}.pdf`);
  };

  const getWhatsAppMessage = (order) => {
    const shortOrderId = order._id.toString().slice(-6).toUpperCase();
    
    let itemsText = order.items.map(item => `  - ${item.nameEN || item.name} x${item.qty} = ₹${item.price * item.qty}`).join('\n');
    let deliveryText = order.deliveryType === 'Delivery' && order.location 
      ? `Delivery to: ${order.location.address}`
      : `Pickup from shop`;
    
    let paymentText = order.paymentMethod === 'Online' ? 'Online — Advance Paid' : 'Cash on Delivery';

    return `Hello Sri Tirupati Venkatachalapathy Bakery! 🎂
I'd like to share my order:

Name: ${order.customerInfo?.name || 'Customer'}
Mobile: ${order.customerInfo?.mobile || 'N/A'}
Items:
${itemsText}
Total: ₹${order.totalAmount}
${deliveryText}
Date & Time: ${new Date(order.requestedDate).toLocaleString()}
Payment: ${paymentText}

Order ID: #${shortOrderId}`;
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader /></div>;
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <ErrorState message={error} onRetry={fetchOrders} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Orders</h2>
      
      {orders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
        >
          <div className="text-6xl mb-6">📦</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No orders yet.</h3>
          <p className="text-gray-500 mb-8">Start shopping to get your favorite treats!</p>
          <Link 
            to="/shop" 
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-full transition-colors"
          >
            Browse Products &rarr;
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.1 } }
          }}
          className="space-y-6"
        >
          <AnimatePresence>
            {orders.map(order => {
              const dateObj = new Date(order.createdAt);
              const isCancelled = order.status === 'Cancelled';
              const currentStepIndex = ORDER_STEPS.indexOf(order.status);
              
              let itemsSummary = '';
              if (order.items && order.items.length > 0) {
                const firstItem = order.items[0].nameEN || order.items[0].name;
                itemsSummary = order.items.length > 1 ? `${firstItem} and ${order.items.length - 1} more items` : firstItem;
              }

              return (
                <motion.div 
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          Order #{order._id.toString().slice(-6).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500">{dateObj.toLocaleString()}</p>
                        <p className="text-gray-700 mt-2 font-medium">{itemsSummary}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-xl font-bold text-gray-900 mb-1">{formatCurrency(order.totalAmount)}</div>
                        <div className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-semibold uppercase">
                          {order.deliveryType}
                        </div>
                      </div>
                    </div>

                    {/* Status Tracker */}
                    <div className="my-8">
                      {isCancelled ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
                          <span className="text-xl">❌</span>
                          <div>
                            <p className="font-bold">Order Cancelled</p>
                            <p className="text-sm opacity-90">{order.cancelReason}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
                            <div 
                              style={{ width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` }} 
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-gray-500">
                            {ORDER_STEPS.map((step, idx) => (
                              <div key={step} className={`text-center w-1/5 ${idx <= currentStepIndex ? 'text-amber-600' : ''}`}>
                                <div className={`w-3 h-3 mx-auto rounded-full mb-1 transition-all duration-500 ${
                                  idx < currentStepIndex ? 'bg-amber-500' : 
                                  idx === currentStepIndex ? 'bg-amber-500 animate-pulse ring-4 ring-amber-200' : 
                                  'bg-gray-300'
                                }`}></div>
                                <span className="hidden sm:block">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-end gap-4 pt-4 border-t border-gray-100">
                      <WhatsAppButton 
                        label="Share" 
                        message={getWhatsAppMessage(order)} 
                        variant="outlined" 
                        className="!px-3 !py-1 !text-sm !rounded-lg"
                      />
                      <button 
                        onClick={() => generateReceipt(order)}
                        className="text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        📄 Receipt
                      </button>
                      
                      {!isCancelled && (order.status === 'Received' || order.status === 'Preparing') && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-600 hover:text-white font-semibold px-4 py-2 border border-red-600 hover:bg-red-600 rounded-lg transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default MyOrders;
