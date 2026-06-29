import React, { useState, useEffect, useContext, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import ProductCard from '../../components/ProductCard';

const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useContext(ToastContext);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nameEN: '',
    nameTe: '',
    category: '',
    price: '',
    weight: '',
    quantity: '',
    descriptionEN: '',
    descriptionTe: '',
    isAvailable: true,
    isSpecial: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  const categories = ['All', 'Bread', 'Bun', 'Cake', 'Pastry', 'Snacks', 'Beverages', 'Other'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/products/all');
      setProducts(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    setFormData({
      nameEN: '', nameTe: '', category: '', price: '', weight: '', quantity: '', descriptionEN: '', descriptionTe: '', isAvailable: true, isSpecial: false
    });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setEditingId(product._id);
    setFormData({
      nameEN: product.nameEN || '',
      nameTe: product.nameTe || '',
      category: product.category || '',
      price: product.price || '',
      weight: product.weight || '',
      quantity: product.quantity ?? '',
      descriptionEN: product.descriptionEN || '',
      descriptionTe: product.descriptionTe || '',
      isAvailable: product.isAvailable,
      isSpecial: product.isSpecial || false,
    });
    setImageFile(null);
    setImagePreview(product.imageUrl || null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (isEditing) {
        const res = await axiosInstance.patch(`/products/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProducts(products.map(p => p._id === editingId ? res.data : p));
        addToast('Product updated successfully', 'success');
      } else {
        const res = await axiosInstance.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProducts([res.data, ...products]);
        addToast('Product added successfully', 'success');
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
      setProducts(products.filter(p => p._id !== deleteId));
      addToast('Product deleted', 'success');
      setDeleteId(null);
    } catch (err) {
      addToast('Failed to delete product', 'error');
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await axiosInstance.patch(`/products/${id}/toggle`);
      setProducts(products.map(p => p._id === id ? res.data : p));
      addToast(`Product marked as ${res.data.isAvailable ? 'Available' : 'Out of Stock'}`, 'info');
    } catch (err) {
      addToast('Failed to toggle availability', 'error');
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nameEN.toLowerCase().includes(search.toLowerCase()) || 
                          (p.nameTe && p.nameTe.includes(search));
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-lg shadow-sm border border-border">
        <div className="flex gap-4 flex-grow max-w-2xl">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full sm:max-w-xs"
          />
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field w-full sm:max-w-xs"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={openAddModal} className="btn-primary whitespace-nowrap">
          + Add Product
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center"><Loader /></div>
      ) : error ? (
        <div className="min-h-[50vh] flex items-center justify-center"><ErrorState message={error} onRetry={fetchProducts} /></div>
      ) : products.length === 0 ? (
        <div className="bg-white py-16 px-4 rounded-lg shadow-sm text-center border border-border">
          <div className="text-5xl mb-4">🥐</div>
          <h3 className="text-xl font-bold text-dark mb-2">No products added yet.</h3>
          <p className="text-muted mb-6">Start building your bakery menu by adding products.</p>
          <button onClick={openAddModal} className="btn-primary inline-flex items-center gap-2">
            + Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="relative">
              <ProductCard 
                product={product} 
                showAdminControls={true}
                onEdit={openEditModal}
                onDelete={(id) => setDeleteId(id)}
              />
              {/* Availability Toggle overlay on top of card bottom */}
              <div className="absolute bottom-16 right-4 z-10 bg-white/90 backdrop-blur rounded p-1 shadow border border-border">
                 <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={product.isAvailable} onChange={() => handleToggleAvailability(product._id)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${product.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${product.isAvailable ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>

              {/* Delete Confirmation Inline */}
              {deleteId === product._id && (
                <div className="absolute inset-0 bg-white/95 z-20 rounded-lg flex flex-col items-center justify-center p-4 text-center border-2 border-red-500">
                  <p className="font-bold text-red-600 mb-2">Delete this product?</p>
                  <p className="text-sm text-muted mb-4">This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setDeleteId(null)} className="btn-secondary py-1 text-sm">Cancel</button>
                    <button onClick={handleDeleteConfirm} className="bg-red-600 text-white font-semibold rounded-md px-4 py-1 hover:bg-red-700 text-sm">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center border border-border">
              <p className="text-muted">No products found matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay overflow-y-auto py-10">
          <div className="modal-content p-6 my-auto max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-dark">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Name (English) *</label>
                  <input type="text" name="nameEN" required value={formData.nameEN} onChange={handleInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Name (Telugu)</label>
                  <input type="text" name="nameTe" value={formData.nameTe} onChange={handleInputChange} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Category *</label>
                  <select name="category" required value={formData.category} onChange={handleInputChange} className="input-field">
                    <option value="" disabled>Select a category</option>
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Price (₹) *</label>
                  <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} onWheel={(e) => e.target.blur()} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Weight</label>
                  <input type="text" name="weight" placeholder="e.g., 500g, 1kg" value={formData.weight} onChange={handleInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Quantity in Stock</label>
                  <input type="number" name="quantity" min="0" value={formData.quantity} onChange={handleInputChange} onWheel={(e) => e.target.blur()} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Description (English)</label>
                <textarea name="descriptionEN" rows="2" value={formData.descriptionEN} onChange={handleInputChange} className="input-field"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Description (Telugu)</label>
                <textarea name="descriptionTe" rows="2" value={formData.descriptionTe} onChange={handleInputChange} className="input-field"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Product Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="input-field text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-accent hover:file:bg-amber-100" />
                {imagePreview && (
                  <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" name="isAvailable" id="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} className="w-4 h-4 text-accent border-border rounded focus:ring-accent" />
                <label htmlFor="isAvailable" className="text-sm font-medium text-dark">Product is available for sale</label>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="isSpecial" id="isSpecial" checked={formData.isSpecial} onChange={handleInputChange} className="w-4 h-4 text-amber-500 border-border rounded focus:ring-amber-500" />
                <label htmlFor="isSpecial" className="text-sm font-medium text-dark">Mark as Special Item ⭐</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
