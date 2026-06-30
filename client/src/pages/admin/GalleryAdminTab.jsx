import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import ImageUploadWithCamera from '../../components/ImageUploadWithCamera';

const CATEGORIES = [
  '1 Year Baby Cakes',
  '6 Months Baby Cakes',
  'Step Cakes',
  'Barbie Doll Cakes',
  "Father's Day Cakes",
  "Mother's Day Cakes",
  'Christmas Cakes',
  'New Year Cakes',
  'Photo Cakes',
  'Cartoon Cakes',
  'Pastry Cakes',
  'Chocolate Cakes',
  'Eggless Cakes',
  'Political Party Cakes',
  'Wedding Cakes', 
  'Birthday Cakes', 
  'Custom Pastries', 
  'Other'
];

const GalleryAdminTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useContext(ToastContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nameEN: '',
    category: 'Other',
    price: '',
    weight: '',
    flavour: '',
    color: '',
    shape: '',
    descriptionEN: '',
    isAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/products/all?isGallery=true');
      setItems(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ nameEN: '', category: 'Other', price: '', weight: '', flavour: '', color: '', shape: '', descriptionEN: '', isAvailable: true });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setFormData({
      nameEN: item.nameEN || '',
      category: item.category || 'Other',
      price: item.price || '',
      weight: item.weight || '',
      flavour: item.flavour || '',
      color: item.color || '',
      shape: item.shape || '',
      descriptionEN: item.descriptionEN || '',
      isAvailable: item.isAvailable,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('nameEN', formData.nameEN);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('weight', formData.weight);
    data.append('flavour', formData.flavour);
    data.append('color', formData.color);
    data.append('shape', formData.shape);
    data.append('descriptionEN', formData.descriptionEN);
    data.append('isAvailable', formData.isAvailable);
    data.append('isGallery', true);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (isEditing) {
        const res = await axiosInstance.patch(`/products/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setItems(items.map((i) => (i._id === editingId ? res.data : i)));
        addToast('Gallery item updated', 'success');
      } else {
        const res = await axiosInstance.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setItems([res.data, ...items]);
        addToast('Gallery item added', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/products/${deleteId}`);
      setItems(items.filter((i) => i._id !== deleteId));
      addToast('Item deleted', 'success');
      setDeleteId(null);
    } catch (err) {
      addToast('Failed to delete item', 'error');
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={fetchItems} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-bold text-dark">Cake Gallery Management</h2>
        <button onClick={openAddModal} className="btn-primary">
          + Add Cake Design
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white py-16 px-4 rounded-lg shadow-sm text-center border border-border">
          <p className="text-muted">No custom cakes in the gallery yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow border border-border overflow-hidden relative">
              <div className="relative">
                <img src={item.imageUrl} alt={item.nameEN} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => openEditModal(item)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteId(item._id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-dark truncate">{item.nameEN}</h3>
                <p className="text-sm text-muted">{item.category}</p>
                <p className="text-sm font-semibold text-amber-600 mt-1">₹{item.price} {item.weight && `| ${item.weight}`}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {deleteId === item._id && (
                <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-4 text-center">
                  <p className="font-bold text-red-600 mb-4">Delete this image?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setDeleteId(null)} className="btn-secondary py-1 px-3 text-sm">Cancel</button>
                    <button onClick={handleDeleteConfirm} className="bg-red-600 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-red-700">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay overflow-y-auto py-10">
          <div className="modal-content p-6 my-auto max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-dark">{isEditing ? 'Edit Cake Design' : 'Add Cake Design'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Cake Name *</label>
                <input type="text" name="nameEN" required value={formData.nameEN} onChange={handleInputChange} className="input-field" placeholder="e.g. Pink Barbie Fondant Cake" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Category *</label>
                <select name="category" required value={formData.category} onChange={handleInputChange} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Price (₹) *</label>
                  <input type="number" name="price" required min="0" value={formData.price} onChange={handleInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Weight</label>
                  <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} className="input-field" placeholder="e.g. 1 Kg" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Flavour</label>
                  <input type="text" name="flavour" value={formData.flavour} onChange={handleInputChange} className="input-field" placeholder="e.g. Butterscotch" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Color</label>
                  <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="input-field" placeholder="e.g. Pink & White" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Shape</label>
                  <input type="text" name="shape" value={formData.shape} onChange={handleInputChange} className="input-field" placeholder="e.g. Heart" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Description</label>
                <textarea name="descriptionEN" value={formData.descriptionEN} onChange={handleInputChange} className="input-field h-20" placeholder="Small description of the cake design..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Image *</label>
                <ImageUploadWithCamera 
                  onImageCaptured={(file) => {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                  imagePreview={imagePreview}
                  isRequired={!isEditing}
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" name="isAvailable" id="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} className="w-4 h-4 text-accent border-border rounded focus:ring-accent" />
                <label htmlFor="isAvailable" className="text-sm font-medium text-dark">Available to order</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryAdminTab;
