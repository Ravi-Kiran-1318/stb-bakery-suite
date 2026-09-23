import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';
import { CartContext } from '../../context/CartContext';
import ImageUploadWithCamera from '../../components/ImageUploadWithCamera';

const CustomOrdersTab = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [, setIsSubmitting] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') || 'All';
  const [activeFilter, setActiveFilter] = useState(defaultTab);
  const { addToast } = useContext(ToastContext);

  const [formData, setFormData] = useState({
    description: '',
    referenceImageUrl: '',
    weight: 1,
    requestedDate: '',
    requestedTime: '',
    flavour: '',
    color: '',
    shape: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchRequests();
    
    // Sync activeFilter with URL tab param
    const currentTab = new URLSearchParams(location.search).get('tab');
    if (currentTab) {
      setActiveFilter(currentTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get(`/custom-cakes/my-requests?t=${Date.now()}`);
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
    
    if (!imageFile) {
      addToast('Please provide a reference image', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const { data } = await axiosInstance.post('/custom-cakes', submitData);
      setRequests([data, ...requests]);
      setShowForm(false);
      
      // Open WhatsApp
      let waNumber = import.meta.env.VITE_SHOP_WHATSAPP || '0000000000';
      if (waNumber.length === 10) waNumber = '91' + waNumber;
      const rawText = `Hello sir/ Madam,\n\nI just submitted a custom cake request.\n\n*Details:*\n- Weight: ${formData.weight} kg\n- Flavour: ${formData.flavour || 'N/A'}\n- Shape: ${formData.shape || 'N/A'}\n- Color: ${formData.color || 'N/A'}\n- Date Required: ${formData.requestedDate}\n- Time Required: ${formData.requestedTime || 'N/A'}\n- Description: ${formData.description}${data.referenceImageUrl ? `\n- Image: ${data.referenceImageUrl}` : ''}`;
      const text = encodeURIComponent(rawText);
      
      setFormData({ description: '', referenceImageUrl: '', weight: 1, requestedDate: '', requestedTime: '', flavour: '', color: '', shape: '' });
      setImageFile(null);
      setImagePreview(null);
      addToast('Custom cake request submitted! Sending you to WhatsApp...', 'success');
      
      setTimeout(() => {
        window.location.href = `https://wa.me/${waNumber}?text=${text}`;
      }, 100);
      
    } catch (error) {
      addToast('Failed to submit request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { addToCart, items } = useContext(CartContext);
  const navigate = useNavigate();

  const handleAddToCart = async (req) => {
    try {
      if (req.status !== 'Accepted') {
        // Set status to accepted in DB
        await axiosInstance.put(`/custom-cakes/${req._id}/accept`);
        setRequests(requests.map(r => r._id === req._id ? { ...r, status: 'Accepted' } : r));
      }
      
      const exists = items.find(i => i.customCakeId === req._id);
      if (!exists) {
        // Add to local CartContext
        const cleanWeight = /[a-zA-Z]/.test(String(req.weight)) ? req.weight : `${req.weight}kg`;
        addToCart({
          _id: req._id,
          nameEN: req.isGalleryRequest ? req.description : `Custom Cake Request - ${cleanWeight}`,
          nameTe: req.isGalleryRequest ? req.description : `Custom Cake Request - ${cleanWeight}`,
          imageUrl: req.referenceImageUrl || req.galleryCakeId?.imageUrl || '/bg3.png',
          price: req.quotePrice,
          isCustomCake: true,
          customCakeId: req._id,
          isGalleryRequest: req.isGalleryRequest || false,
          requestedDate: req.requestedDate,
          requestedTime: req.requestedTime
        });
      }
      
      addToast('Proceeding to checkout...', 'success');
      navigate('/checkout-addons');
    } catch (error) {
      addToast('Failed to proceed', 'error');
    }
  };

  const handleCancelQuote = async (id) => {
    try {
      await axiosInstance.put(`/custom-cakes/${id}/cancel`);
      setRequests(requests.map(req => req._id === id ? { ...req, status: 'Cancelled' } : req));
      addToast('Request cancelled successfully', 'success');
    } catch (error) {
      addToast('Failed to cancel request', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending Review</span>;
      case 'Quoted': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Quote Received</span>;
      case 'Accepted': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Accepted</span>;
      case 'Rejected': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Declined</span>;
      case 'Cancelled': return <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-semibold">Cancelled</span>;
      case 'Completed': return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Completed</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading your requests...</div>;
  }

  const filteredRequests = requests.filter(req => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Custom Cakes') return !req.isGalleryRequest;
    if (activeFilter === 'Gallery Cakes') return req.isGalleryRequest;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-end pb-2">
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors w-full sm:w-auto text-center"
          >
            + Request Custom Cake
          </button>
        )}
      </div>

      {!showForm && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Custom Cakes', 'Gallery Cakes'].map(filter => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                navigate(`/custom-cakes?tab=${encodeURIComponent(filter)}`, { replace: true });
              }}
              className={`px-4 sm:px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors border-2 ${
                activeFilter === filter 
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

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
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Reference Image *</label>
              <ImageUploadWithCamera 
                onImageCaptured={(file) => {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
                imagePreview={imagePreview}
                isRequired={true}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approx. Weight (kg) *</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flavour</label>
                <input 
                  type="text"
                  name="flavour"
                  value={formData.flavour}
                  onChange={handleChange}
                  placeholder="e.g. Chocolate, Vanilla"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input 
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g. Pink, Blue"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
                <input 
                  type="text"
                  name="shape"
                  value={formData.shape}
                  onChange={handleChange}
                  placeholder="e.g. Round, Heart"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Required By</label>
                <select 
                  name="requestedTime"
                  value={formData.requestedTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="" disabled>Select a time slot</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                </select>
              </div>
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

      {!showForm && filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="w-20 h-20 mb-4 bg-amber-50 rounded-full flex items-center justify-center">
            <span className="text-5xl">🎂</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No custom requests yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm">Have a dream cake in mind? Upload a photo and get a custom quote from our bakers today!</p>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-md transition-transform transform hover:scale-105 active:scale-95"
          >
            Start Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => (
            <div key={req._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
              {(req.referenceImageUrl || (req.isGalleryRequest && req.galleryCakeId?.imageUrl)) && (
                <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img src={req.referenceImageUrl || req.galleryCakeId.imageUrl} alt="Reference" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                </div>
              )}
              
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg text-gray-800">{req.isGalleryRequest ? 'Gallery Cake Quote Request' : 'Custom Cake Quote Request'}</h4>
                    {req.isGalleryRequest && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">Gallery</span>}
                  </div>
                  {getStatusBadge(req.status)}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{req.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Weight:</span> <span className="font-medium">{req.weight}{/[a-zA-Z]/.test(String(req.weight)) ? '' : ' kg'}</span>
                  </div>
                  {req.flavour && (
                    <div>
                      <span className="text-gray-500">Flavour:</span> <span className="font-medium">{req.flavour}</span>
                    </div>
                  )}
                  {req.color && (
                    <div>
                      <span className="text-gray-500">Color:</span> <span className="font-medium">{req.color}</span>
                    </div>
                  )}
                  {req.shape && (
                    <div>
                      <span className="text-gray-500">Shape:</span> <span className="font-medium">{req.shape}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Needed By:</span> <span className="font-medium">{new Date(req.requestedDate).toLocaleDateString()} {req.requestedTime && `at ${req.requestedTime}`}</span>
                  </div>
                </div>

                {req.status === 'Quoted' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2">
                    <p className="text-sm text-blue-800 mb-2">
                      <span className="font-semibold">Bakery Admin:</span> We can make this for <span className="font-bold text-lg">₹{req.quotePrice}</span>.
                      {req.adminNotes && <span className="block mt-1 italic text-blue-700">&quot;{req.adminNotes}&quot;</span>}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={() => handleAddToCart(req)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
                      >
                        Accept & Proceed to Checkout
                      </button>
                      <button 
                        onClick={() => handleCancelQuote(req._id)}
                        className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                )}
                
                {req.status === 'Accepted' && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-sm text-green-700 font-medium">
                      Quote Accepted (₹{req.quotePrice}).
                    </p>
                    <button 
                      onClick={() => handleAddToCart(req)}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}

                {req.status === 'Rejected' && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mt-2">
                    <p className="text-sm text-red-700 font-medium flex items-start gap-2">
                      <span className="text-lg mt-0.5">❌</span>
                      <span>
                        <strong className="block mb-1 text-red-800">Request Declined</strong>
                        {req.adminNotes ? req.adminNotes : 'No reason provided.'}
                      </span>
                    </p>
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
