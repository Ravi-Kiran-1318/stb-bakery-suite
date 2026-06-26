import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import PageWrapper from '../../components/PageWrapper';
import axiosInstance from '../../utils/axiosInstance';
import { formatCurrency } from '../../utils/formatCurrency';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000); // Stop confetti after 3 seconds

    return () => clearTimeout(timer);
  }, [orderId]);

  const generateReceipt = () => {
    if (!order) return;
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
    
    doc.text(`Customer: ${order.customerInfo.name}`, 130, 65);
    doc.text(`Mobile: ${order.customerInfo.mobile}`, 130, 72);
    
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

  const handleWhatsAppShare = () => {
    if (!order) return;
    const shopWhatsApp = import.meta.env.VITE_SHOP_WHATSAPP || '910000000000';
    const shortOrderId = order._id.toString().slice(-6).toUpperCase();
    
    let itemsText = order.items.map(item => `  - ${item.nameEN || item.name} x${item.qty} = ₹${item.price * item.qty}`).join('\n');
    let deliveryText = order.deliveryType === 'Delivery' && order.location 
      ? `Delivery to: ${order.location.address}`
      : `Pickup from shop`;
    
    let paymentText = order.paymentMethod === 'Online' ? 'Online — Advance Paid' : 'Cash on Delivery';

    let text = `Hello Sri Tirupati Venkatachalapathy Bakery! 🎂
I'd like to share my order:

Name: ${order.customerInfo.name}
Mobile: ${order.customerInfo.mobile}
Items:
${itemsText}
Total: ₹${order.totalAmount}
${deliveryText}
Date & Time: ${new Date(order.requestedDate).toLocaleString()}
Payment: ${paymentText}

Order ID: #${shortOrderId}`;

    const url = `https://wa.me/${shopWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <Link to="/shop" className="text-amber-600 hover:text-amber-700 font-semibold underline">Return to Shop</Link>
      </div>
    );
  }

  const requestedDateObj = new Date(order.requestedDate);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="bg-green-50 p-8 text-center border-b border-green-100 relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
              className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg shadow-green-500/30"
            >
              ✓
            </motion.div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-green-800 font-medium text-lg">
              Order ID: <span className="font-bold">{order._id.toString().slice(-6).toUpperCase()}</span>
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Total Amount</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Payment Method</span>
                <span className="font-semibold text-gray-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">{order.deliveryType} Date & Time</span>
                <span className="font-semibold text-gray-900 text-right max-w-[60%]">
                  {requestedDateObj.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleWhatsAppShare}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <span>📲</span> Share on WhatsApp
              </button>
              
              <button 
                onClick={generateReceipt}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 font-bold py-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>📄</span> Download Receipt
              </button>
              
              <Link 
                to="/customer/dashboard?tab=orders"
                className="w-full mt-4 text-center text-amber-600 hover:text-amber-700 font-semibold"
              >
                View My Orders &rarr;
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
};

export default OrderConfirmation;
