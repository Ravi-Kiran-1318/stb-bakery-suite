import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { formatCurrency } from '../../utils/formatCurrency';
import { ToastContext } from '../../context/ToastContext';
import { useContext } from 'react';
import { haversine } from '../../utils/haversine';
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
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  
  const [requestedDate, setRequestedDate] = useState(() => {
    const customCakeItem = items.find(i => i.isCustomCake);
    if (customCakeItem && customCakeItem.requestedDate) {
      return customCakeItem.requestedDate.substring(0, 10);
    }
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [requestedTime, setRequestedTime] = useState(() => {
    const customCakeItem = items.find(i => i.isCustomCake);
    if (customCakeItem && customCakeItem.requestedTime) {
      return customCakeItem.requestedTime;
    }
    return '10:00 AM - 12:00 PM';
  });
  
  const TIME_SLOTS = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items, navigate]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await axiosInstance.get('/users/addresses');
        setSavedAddresses(data);
        if (data.length > 0) {
          const defaultAddr = data.find(a => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr._id);
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (error) {
        console.error("Failed to load addresses", error);
      }
    };
    if (user) fetchAddresses();
  }, [user]);

  const shopLat = parseFloat(import.meta.env.VITE_SHOP_LAT) || 13.6288;
  const shopLng = parseFloat(import.meta.env.VITE_SHOP_LNG) || 79.4192;
  const shopAddress = "Sri Tirupati Venkatachalapathy Bakery, Tirupati";

  useEffect(() => {
    if (deliveryType === 'Delivery' && !isAddingNewAddress && selectedAddressId && savedAddresses.length > 0) {
      const sAddr = savedAddresses.find(a => a._id === selectedAddressId);
      if (sAddr && sAddr.lat && sAddr.lng) {
        const dist = haversine(shopLat, shopLng, sAddr.lat, sAddr.lng);
        setDistanceKm(dist);
      } else {
        setDistanceKm(9999); // Flag for missing coordinates
      }
    }
  }, [deliveryType, isAddingNewAddress, selectedAddressId, savedAddresses, shopLat, shopLng]);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  // Dynamic Delivery Fee Logic
  const hasCake = items.some(item => 
    item.isCustomCake || 
    item.isGallery || 
    (item.category && item.category.toLowerCase().includes('cake'))
  );
  const baseDeliveryFee = hasCake ? 30 : 20;

  const deliveryFee = deliveryType === 'Delivery' ? baseDeliveryFee : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleLocationSelect = useCallback((lat, lng, address, dist) => {
    setLocation({ lat, lng, address });
    setAddressText(address);
    setDistanceKm(dist);
  }, []);

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  };

  const isFormValid = () => {
    if (!requestedDate) return false;
    if (!paymentMethod) return false;
    if (deliveryType === 'Delivery') {
      if (distanceKm > 5) return false;
      if (!isAddingNewAddress && selectedAddressId) {
        return true;
      }
      if (isAddingNewAddress || savedAddresses.length === 0) {
        if (!location) return false;
        if (!addressText.trim()) return false;
      }
    }
    return true;
  };

  const sendWhatsApp = (orderId) => {
    let waNumber = import.meta.env.VITE_SHOP_WHATSAPP || '0000000000';
    if (waNumber.length === 10) waNumber = '91' + waNumber;

    let itemsText = '';
    items.forEach(item => {
      let extraDetails = '';
      if (item.flavour) extraDetails += ` | ${item.flavour}`;
      if (item.color) extraDetails += ` | ${item.color}`;
      if (item.shape) extraDetails += ` | ${item.shape}`;
      if (item.imageUrl) extraDetails += `\n  Image: ${item.imageUrl}`;

      if (item.isCustomCake) {
        itemsText += `- [Custom Request] ${item.nameEN} (Qty: ${item.qty})${extraDetails}\n`;
      } else if (item.isGallery) {
        itemsText += `- [Cake Gallery] ${item.nameEN} (Qty: ${item.qty})${extraDetails}\n`;
      } else {
        itemsText += `- ${item.nameEN} (Qty: ${item.qty})${extraDetails}\n`;
      }
    });

    const rawText = `Hello sir/ Madam,\n\nI just placed a new order!\n\n*Order ID:* ${orderId}\n*Delivery Type:* ${deliveryType}\n*Date:* ${requestedDate}\n*Time:* ${requestedTime}\n*Total Amount:* ₹${totalAmount}\n*Payment:* ${paymentMethod}\n\n*Items:*\n${itemsText}`;
    const text = encodeURIComponent(rawText);
    
    // Navigate before redirecting so when user returns, they are on dashboard
    navigate('/customer/dashboard?tab=orders', { replace: true });
    
    // Slight timeout to let React router finish state update
    setTimeout(() => {
      window.location.href = `https://wa.me/${waNumber}?text=${text}`;
    }, 100);
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid()) return;
    setIsSubmitting(true);
    
    try {
      let finalLocation = null;
      if (deliveryType === 'Delivery') {
        if (!isAddingNewAddress && selectedAddressId) {
          const sAddr = savedAddresses.find(a => a._id === selectedAddressId);
          finalLocation = {
            address: `${sAddr.addressLine1}, ${sAddr.addressLine2 ? sAddr.addressLine2 + ', ' : ''}${sAddr.city}, ${sAddr.state} ${sAddr.pincode}`,
            lat: sAddr.lat,
            lng: sAddr.lng
          };
        } else {
          finalLocation = { ...location, address: addressText };
        }
      }
      
      const orderData = {
        items,
        deliveryType,
        location: finalLocation,
        requestedDate,
        requestedTime,
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
          description: 'Advance Payment (20%)',
          order_id: orderResponse.razorpayOrderId,
          prefill: {
            name: user.name,
            email: user.email || '',
            contact: user.mobile,
          },
          theme: { color: '#F59E0B' },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            }
          },
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
                addToast('Order placed successfully! Redirecting to WhatsApp...', 'success');
                sendWhatsApp(data._id);
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
        addToast('Order placed successfully! Redirecting to WhatsApp...', 'success');
        sendWhatsApp(data._id);
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
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden space-y-6"
                  >
                    <h2 className="text-xl font-bold text-gray-900">Delivery Location</h2>
                    
                    {!isAddingNewAddress && savedAddresses.length > 0 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedAddresses.map((addr) => (
                            <div 
                              key={addr._id} 
                              onClick={() => setSelectedAddressId(addr._id)}
                              className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${selectedAddressId === addr._id ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-200 hover:border-amber-300'}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '💼' : '📍'}</span>
                                <span className="font-bold text-gray-800">{addr.type}</span>
                                {addr.isDefault && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded ml-auto">Default</span>}
                              </div>
                              <p className="text-sm text-gray-600 font-medium">{addr.name}</p>
                              <p className="text-sm text-gray-600 truncate">{addr.addressLine1}, {addr.city}</p>
                            </div>
                          ))}
                        </div>
                        {distanceKm <= 5 && distanceKm > 0 && distanceKm !== 9999 && (
                          <div className="mt-4 bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex items-start gap-3">
                            <span className="text-xl">✅</span>
                            <p className="font-medium mt-0.5">Eligible for delivery. Distance: {distanceKm.toFixed(1)} km</p>
                          </div>
                        )}
                        {distanceKm > 5 && distanceKm !== 9999 && (
                          <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <p className="font-medium mt-0.5">This saved address is outside our 5km delivery zone ({distanceKm.toFixed(1)} km). Please choose a closer location or switch to Pickup.</p>
                          </div>
                        )}
                        {distanceKm === 9999 && (
                          <div className="mt-4 bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                            <span className="text-xl">📍</span>
                            <p className="font-medium mt-0.5">This address is missing exact map coordinates. Please click "+ Add a new address" below and physically drop the pin on the map so we can verify your delivery distance.</p>
                          </div>
                        )}
                        <button 
                          onClick={() => setIsAddingNewAddress(true)}
                          className="text-amber-600 font-bold hover:text-amber-700 flex items-center gap-1 mt-2"
                        >
                          + Add a new address
                        </button>
                      </div>
                    )}

                    {(isAddingNewAddress || savedAddresses.length === 0) && (
                      <div className="space-y-6">
                        {savedAddresses.length > 0 && (
                          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <h3 className="font-bold text-gray-800">Pinpoint new location</h3>
                            <button 
                              onClick={() => setIsAddingNewAddress(false)}
                              className="text-sm text-gray-500 hover:text-gray-700 font-medium underline"
                            >
                              Use saved address
                            </button>
                          </div>
                        )}
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
                        
                        {distanceKm > 5 && (
                          <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <p className="font-medium mt-0.5">Your location is outside our 5km delivery zone. Switch to Pickup or choose a closer location.</p>
                          </div>
                        )}
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
                    
                    <div className="relative w-full h-[350px] rounded-2xl overflow-hidden shadow-md border border-gray-200">
                      <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.9940654032895!2d79.4184646!3d13.6288!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d4b1a4bb7433f%3A0x6d11fbdc21062635!2sSri%20Tirupathi%20Venkatachalapathi%20Bakery!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                      
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${shopLat},${shopLng}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute top-4 left-4 bg-white px-4 py-2.5 rounded-lg shadow-lg font-bold text-blue-600 flex items-center gap-2 hover:bg-gray-50 transition-colors z-10"
                      >
                        Open in Maps <span className="text-lg">↗</span>
                      </a>
                    </div>
                    
                    <div className="mt-4 bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                      <span className="text-2xl mt-0.5">🏪</span>
                      <div>
                        <p className="font-bold text-gray-900">Sri Tirupati Venkatachalapathy Bakery</p>
                        <p className="text-gray-700 text-sm mt-0.5">{shopAddress}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Date & Time */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Requested Date & Time</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                    <input 
                      type="date" 
                      className="input-field w-full"
                      value={requestedDate}
                      min={getMinDate()}
                      max={getMaxDate()}
                      onChange={(e) => setRequestedDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot</label>
                    <select 
                      className="input-field w-full"
                      value={requestedTime}
                      onChange={(e) => setRequestedTime(e.target.value)}
                    >
                      {TIME_SLOTS.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
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
                    <p className="text-sm text-gray-600 pl-9">Pay 20% advance now, rest on delivery</p>
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
                    className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 font-medium space-y-2"
                  >
                    <div>
                      You will pay <span className="font-bold">₹{Math.ceil(totalAmount * 0.2)}</span> now. Remaining ₹{totalAmount - Math.ceil(totalAmount * 0.2)} on delivery.
                    </div>
                    <div className="text-sm text-blue-700 opacity-90">
                      *Note: Minimum 20% of the total estimated price should be paid in advance.
                    </div>
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
