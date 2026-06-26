import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { motion } from 'framer-motion';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      return setError('Please enter a valid 10-digit mobile number');
    }

    setLoading(true);
    try {
      await signup({
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
        >
          <div>
            <h2 className="mt-2 text-center text-3xl font-bold font-serif text-gray-900">
              Create an Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join us to order delicious baked goods
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field mt-1"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  maxLength="10"
                  className="input-field mt-1"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
                <input
                  type="email"
                  name="email"
                  className="input-field mt-1"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="input-field mt-1"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="input-field mt-1"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account? <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">Sign in</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Signup;
