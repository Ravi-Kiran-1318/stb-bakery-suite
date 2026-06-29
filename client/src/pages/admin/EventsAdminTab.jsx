import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

const EventsAdminTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useContext(ToastContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/events/all');
      setEvents(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
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
    setFormData({ title: '', description: '', date: '', isActive: true });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setIsEditing(true);
    setEditingId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      isActive: event.isActive,
    });
    setImageFile(null);
    setImagePreview(event.imageUrl);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date);
    data.append('isActive', formData.isActive);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (isEditing) {
        const res = await axiosInstance.patch(`/events/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setEvents(events.map((e) => (e._id === editingId ? res.data : e)));
        addToast('Event updated', 'success');
      } else {
        const res = await axiosInstance.post('/events', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setEvents([...events, res.data].sort((a, b) => new Date(a.date) - new Date(b.date)));
        addToast('Event created', 'success');
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
      await axiosInstance.delete(`/events/${deleteId}`);
      setEvents(events.filter((e) => e._id !== deleteId));
      addToast('Event deleted', 'success');
      setDeleteId(null);
    } catch (err) {
      addToast('Failed to delete event', 'error');
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={fetchEvents} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-bold text-dark">Events Management</h2>
        <button onClick={openAddModal} className="btn-primary">
          + Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white py-16 px-4 rounded-lg shadow-sm text-center border border-border">
          <p className="text-muted">No events created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow border border-border overflow-hidden relative">
              {event.imageUrl && (
                <img src={event.imageUrl} alt={event.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-dark">{event.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${event.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {event.isActive ? 'Active' : 'Past'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-amber-600 mb-2">
                  {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                <div className="mt-4 flex gap-2 border-t border-border pt-4">
                  <button onClick={() => openEditModal(event)} className="flex-1 btn-secondary py-1 text-sm">Edit</button>
                  <button onClick={() => setDeleteId(event._id)} className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 rounded font-semibold py-1 text-sm">Delete</button>
                </div>
              </div>

              {deleteId === event._id && (
                <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-4 text-center">
                  <p className="font-bold text-red-600 mb-4">Delete this event?</p>
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
            <h2 className="text-2xl font-bold mb-6 text-dark">{isEditing ? 'Edit Event' : 'Create Event'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Event Title *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Date *</label>
                <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Description *</label>
                <textarea name="description" required rows="3" value={formData.description} onChange={handleInputChange} className="input-field"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Event Image / Flyer</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="input-field" />
                {imagePreview && (
                  <div className="mt-2 w-full h-40 rounded-lg overflow-hidden border border-border">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-accent border-border rounded focus:ring-accent" />
                <label htmlFor="isActive" className="text-sm font-medium text-dark">Active (Show to public)</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsAdminTab;
