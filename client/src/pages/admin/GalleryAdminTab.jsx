import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

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
    title: '',
    category: 'Other',
    isVisible: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/gallery/all');
      setItems(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gallery');
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
    setFormData({ title: '', category: 'Other', isVisible: true });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setFormData({
      title: item.title,
      category: item.category,
      isVisible: item.isVisible,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('isVisible', formData.isVisible);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (isEditing) {
        const res = await axiosInstance.patch(`/gallery/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setItems(items.map((i) => (i._id === editingId ? res.data : i)));
        addToast('Gallery item updated', 'success');
      } else {
        const res = await axiosInstance.post('/gallery', data, {
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
      await axiosInstance.delete(`/gallery/${deleteId}`);
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
        <h2 className="text-xl font-bold text-dark">Gallery Management</h2>
        <button onClick={openAddModal} className="btn-primary">
          + Add Image
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white py-16 px-4 rounded-lg shadow-sm text-center border border-border">
          <p className="text-muted">No images in the gallery yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow border border-border overflow-hidden relative">
              <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-3">
                <h3 className="font-bold text-dark truncate">{item.title}</h3>
                <p className="text-sm text-muted">{item.category}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(item)} className="text-blue-500 hover:text-blue-700">✏️</button>
                    <button onClick={() => setDeleteId(item._id)} className="text-red-500 hover:text-red-700">🗑️</button>
                  </div>
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
            <h2 className="text-2xl font-bold mb-6 text-dark">{isEditing ? 'Edit Image' : 'Add Image'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Title *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Category *</label>
                <select name="category" required value={formData.category} onChange={handleInputChange} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Image *</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="input-field" required={!isEditing} />
                {imagePreview && (
                  <div className="mt-2 w-full h-40 rounded-lg overflow-hidden border border-border">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" name="isVisible" id="isVisible" checked={formData.isVisible} onChange={handleInputChange} className="w-4 h-4 text-accent border-border rounded focus:ring-accent" />
                <label htmlFor="isVisible" className="text-sm font-medium text-dark">Visible in public gallery</label>
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
