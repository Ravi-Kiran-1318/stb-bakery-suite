import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { formatCurrency } from '../../utils/formatCurrency';
import { ToastContext } from '../../context/ToastContext';
import { useContext } from 'react';
import MapPicker from '../../components/MapPicker';
import PageWrapper from '../../components/PageWrapper';

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);

  const [deliveryType, setDeliveryType] = useState('Delivery'); // 'Delivery' or 'Pickup'
  const [location, setLocation] = useState(null);
  const [addressText, setAddressText] = useState('');
  const [distanceKm, setDistanceKm] = useState(0);
  
  const [requestedDate, setRequestedDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
    
    // Set default datetime to tomorrow 10 AM
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(10, 0, 0, 0);
    // Format to YYYY-MM-DDThh:mm
    const pad = n => String(n).padStart(2, '0');
    setRequestedDate(`${tmrw.getFullYear()}-${pad(tmrw.getMonth()+1)}-${pad(tmrw.getDate())}T${pad(tmrw.getHours())}:${pad(tmrw.getMinutes())}`);
  }, [items, navigate]);

  const shopLat = parseFloat(import.meta.env.VITE_SHOP_LAT) || 13.6288;
  const shopLng = parseFloat(import.meta.env.VITE_SHOP_LNG) || 79.4192;
  const shopAddress = "Sri Tirupati Venkatachalapathy Bakery, Tirupati";

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryFee = (deliveryType === 'Delivery' && distanceKm <= 10) ? 50 : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleLocationSelect = (lat, lng, address, dist) => {
    setLocation({ lat, lng, address });
    setAddressText(address);
    setDistanceKm(dist);
  };

  const getMinDateTime = () => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(0, 0, 0, 0);
    return tmrw.toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 16);
  };

  const isFormValid = () => {
    if (!requestedDate) return false;
    if (!paymentMethod) return false;
    if (deliveryType === 'Delivery') {
      if (!location) return false;
      if (distanceKm > 10) return false;
      if (!addressText.trim()) return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid()) return;
    setIsSubmitting(true);
    
    try {
      const finalLocation = deliveryType === 'Delivery' ? { ...location, address: addressText } : null;
      
      const orderData = {
        items,
        deliveryType,
        location: finalLocation,
        requestedDate,
        paymentMethod,
        notes,
        customerInfo: { name: user.name, mobile: user.mobile, email: user.email }
      };

      if (paymentMethod === 'Online') {
        const { data: orderResponse } = await axiosInstance.post('/payments/create-order', { totalAmount });
        
        const options = {
          key: orderResponse.keyId,
          amount: orderResponse.advanceAmount * 100,
          currency: 'INR',
          name: 'Sri Tirupati Venkatachalapathy Bakery',
          description: 'Advance Payment (50%)',
          order_id: orderResponse.razorpayOrderId,
          prefill: {
            name: user.name,
            email: user.email || '',
            contact: user.mobile,
          },
          theme: { color: '#F59E0B' },
          handler: async (response) => {
            try {
              const verifyRes = await axiosInstance.post('/payments/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.data.verified) {
                // Now create actual order
                const { data } = await axiosInstance.post('/orders', {
                  ...orderData,
                  advancePaid: true,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                });
                
                clearCart();
                addToast('Order placed successfully!', 'success');
                navigate(`/order-confirmation/${data._id}`);
              }
            } catch (error) {
              addToast('Payment verification failed.', 'error');
              setIsSubmitting(false);
            }
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response) {
          addToast('Payment failed. Please try again.', 'error');
          setIsSubmitting(false);
        });
        razorpay.open();
        
      } else {
        // COD Flow
        const { data } = await axiosInstance.post('/orders', orderData);
        clearCart();
        addToast('Order placed successfully!', 'success');
        navigate(`/order-confirmation/${data._id}`);
      }
      
    } catch (error) {
      addToast('Failed to initiate order: ' + (error.response?.data?.message || error.message), 'error');
      setIsSubmitting(false);
    }
  };



  if (items.length === 0) return null;

  return (
    <PageWrapper>
      <div className="bg-gray-50 min-h-[100dvh] pt-16 pb-32 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            
            {/* Left: Form sections */}
            <div className="flex-grow w-full space-y-8">
              
              {/* Delivery Type Toggle */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">How would you like to receive your order?</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setDeliveryType('Delivery')}
                    className={`p-4 rounded-xl text-lg font-bold transition-all ${
                      deliveryType === 'Delivery' 
                        ? 'bg-amber-500 text-white shadow-md border-transparent' 
                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-amber-500'
                    }`}
                  >
                    🚚 Delivery
                  </button>
                  <button 
                    onClick={() => setDeliveryType('Pickup')}
                    className={`p-4 rounded-xl text-lg font-bold transition-all ${
                      deliveryType === 'Pickup' 
                        ? 'bg-amber-500 text-white shadow-md border-transparent' 
                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-amber-500'
                    }`}
                  >
                    🏪 Pickup
                  </button>
                </div>
              </div>

              {/* Delivery Location or Pickup Info */}
              <AnimatePresence mode="wait">
                {deliveryType === 'Delivery' ? (
                  <motion.div 
                    key="delivery"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Location</h2>
                    
                    <MapPicker 
                      shopLat={shopLat} 
                      shopLng={shopLng} 
                      onLocationSelect={handleLocationSelect} 
                    />
                    
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Address</label>
                      <textarea 
                        className="input-field w-full h-20 resize-none"
                        value={addressText}
                        onChange={(e) => setAddressText(e.target.value)}
                        placeholder="House/Flat No, Landmark, etc."
                      />
                    </div>
                    
                    {distanceKm > 10 && (
                      <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <p className="font-medium mt-0.5">Your location is outside our 10km delivery zone. Switch to Pickup or choose a closer location.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="pickup"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Pickup Location</h2>
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-center gap-4">
                      <span className="text-4xl">🏪</span>
                      <div>
                        <p className="font-bold text-gray-900">You will pick up your order from:</p>
                        <p className="text-gray-700 mt-1">{shopAddress}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Date & Time */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Requested Date & Time</h2>
                <input 
                  type="datetime-local" 
                  className="input-field max-w-sm w-full"
                  value={requestedDate}
                  min={getMinDateTime()}
                  max={getMaxDateTime()}
                  onChange={(e) => setRequestedDate(e.target.value)}
                />
                <p className="text-gray-500 text-sm mt-3 flex items-center gap-2">
                  <span>💡</span> We need at least 24 hours. For custom cakes, order 2–3 days ahead.
                </p>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentMethod('Online')}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'Online' 
                        ? 'border-amber-500 bg-amber-50 shadow-md' 
                        : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💳</span>
                      <h3 className="font-bold text-gray-900 text-lg">Pay Online (Razorpay)</h3>
                    </div>
                    <p className="text-sm text-gray-600 pl-9">Pay 50% advance now, rest on delivery</p>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('COD')}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'COD' 
                        ? 'border-amber-500 bg-amber-50 shadow-md' 
                        : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💵</span>
                      <h3 className="font-bold text-gray-900 text-lg">Cash on {deliveryType}</h3>
                    </div>
                    <p className="text-sm text-gray-600 pl-9">Pay full amount when you receive your order</p>
                  </div>
                </div>

                {paymentMethod === 'Online' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 font-medium"
                  >
                    You will pay <span className="font-bold">₹{Math.ceil(totalAmount / 2)}</span> now. Remaining ₹{totalAmount - Math.ceil(totalAmount / 2)} on delivery.
                  </motion.div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Notes (Optional)</h2>
                <textarea 
                  className="input-field w-full h-24 resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests? E.g. Eggless cake, message on cake..."
                />
              </div>

            </div>

            {/* Right: Sticky Summary */}
            <div className="w-full lg:w-96 flex-shrink-0 sticky top-24">
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-600 flex-1 pr-4 line-clamp-2">{item.qty}x {item.nameEN}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {deliveryType === 'Delivery' && (
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee {distanceKm > 0 ? `(${distanceKm.toFixed(1)} km)` : ''}</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-amber-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full mt-8 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    `Place Order • ${formatCurrency(totalAmount)}`
                  )}
                </button>
                
                {!isFormValid() && (
                  <p className="text-center text-xs text-red-500 mt-3 font-medium">
                    Please complete all required fields.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Checkout;
