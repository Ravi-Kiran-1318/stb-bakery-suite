import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

const CustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axiosInstance.get('/users/customers');
        setCustomers(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm)
  );

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader fullScreen={false} /></div>;
  if (error) return <div className="min-h-[50vh] flex items-center justify-center"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;

  if (customers.length === 0) {
    return (
      <div className="bg-white py-16 px-4 rounded-lg shadow-sm text-center border border-border mt-6">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-xl font-bold text-dark mb-2">No customers registered yet.</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-display text-dark">Customers</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-border focus:ring-accent focus:border-accent text-sm"
          />
          <svg
            className="w-5 h-5 text-muted absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-dark">
            <thead className="bg-surface border-b border-border text-muted">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Mobile</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold text-center">Total Orders</th>
                <th className="px-6 py-3 font-semibold text-right">Total Spent</th>
                <th className="px-6 py-3 font-semibold text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <React.Fragment key={customer._id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setExpandedRow(expandedRow === customer._id ? null : customer._id)}
                      className="border-b border-border hover:bg-surface cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{customer.name}</td>
                      <td className="px-6 py-4">{customer.mobile}</td>
                      <td className="px-6 py-4 text-muted">{customer.email || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-surface border border-border px-2 py-1 rounded-full text-xs font-bold">
                          {customer.totalOrders}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">₹{customer.totalSpent.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-muted">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                    <AnimatePresence>
                      {expandedRow === customer._id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-surface/50 border-b border-border"
                        >
                          <td colSpan="6" className="px-6 py-4">
                            <div className="flex gap-8">
                              <div>
                                <p className="text-xs font-semibold text-muted uppercase mb-2">Loyalty Points</p>
                                <div className="flex items-center gap-2 text-accent font-bold text-lg">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {customer.loyaltyPoints} pts
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted uppercase mb-2">Occasion Reminders</p>
                                {customer.occasionReminders && customer.occasionReminders.length > 0 ? (
                                  <ul className="space-y-1 text-sm text-dark">
                                    {customer.occasionReminders.map((occ, i) => (
                                      <li key={i} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                                        <span className="font-medium">{occ.label}:</span> {occ.date}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted italic">No reminders set</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersTab;
