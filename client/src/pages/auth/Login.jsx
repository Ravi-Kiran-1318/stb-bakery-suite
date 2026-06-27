import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth(); // rename loading to authLoading from context

  // Extract ?redirect= param
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect');

  useEffect(() => {
    if (user && !authLoading) {
      if (redirect) {
        navigate(redirect);
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    }
  }, [user, authLoading, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
    // In the real app, this calls api.post('/auth/login')
    const loggedInUser = await login(loginId, password);
    
    // Handle redirect
    if (redirect) {
      navigate(redirect);
    } else {
      if (loggedInUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
        >
          <div>
            <h2 className="mt-2 text-center text-3xl font-bold font-serif text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please sign in to your account
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
                <label className="block text-sm font-medium text-gray-700">Mobile Number or Gmail / Email</label>
                <input
                  type="text"
                  required
                  className="input-field mt-1"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter your 10-digit mobile or gmail address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  className="input-field mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-600 mt-4">
              Don't have an account? <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-semibold">Sign up</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Login;
