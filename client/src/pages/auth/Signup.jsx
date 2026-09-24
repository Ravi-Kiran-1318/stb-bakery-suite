import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { useI18n } from '../../context/I18nContext';

const Signup = () => {
  const { signup, user, loading: authLoading, firebaseLoginAction, completeGoogleSignupAction } = useAuth();
  const navigate = useNavigate();

  // Google auth states
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState('');
  const [googleMobile, setGoogleMobile] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { t } = useI18n();

  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    }
  }, [user, authLoading, navigate]);

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
      return setError(t('SignupPage.PassMismatch', null, 'Passwords do not match'));
    }
    
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      return setError(t('SignupPage.InvalidMobile', null, 'Please enter a valid 10-digit mobile number'));
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
      setError(err.response?.data?.message || t('SignupPage.SignupFailed', null, 'Signup failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const response = await firebaseLoginAction(idToken);
      
      if (response.requireMobile) {
        setGoogleIdToken(idToken);
        setShowMobilePrompt(true);
      } else {
        // Logged in successfully
        navigate(response.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMobileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await completeGoogleSignupAction(googleIdToken, googleMobile);
      setShowMobilePrompt(false);
      navigate(loggedInUser.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration');
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
              {t('SignupPage.CreateAccount', null, 'Create an Account')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('SignupPage.JoinUs', null, 'Join us to order delicious baked goods')}
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
                <label className="block text-sm font-medium text-gray-700">{t('SignupPage.FullName', null, 'Full Name *')}</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field mt-1"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('SignupPage.FullNamePh', null, 'Enter your full name')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('SignupPage.MobileNumber', null, 'Mobile Number *')}</label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  maxLength="10"
                  className="input-field mt-1"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder={t('SignupPage.MobileNumberPh', null, '10-digit mobile number')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{t('SignupPage.EmailOptional', null, 'Email Address (Optional)')}</label>
                <input
                  type="email"
                  name="email"
                  className="input-field mt-1"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('SignupPage.EmailPh', null, 'Enter your email')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('SignupPage.Password', null, 'Password *')}</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className="input-field w-full pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('SignupPage.PasswordPh', null, 'Create a password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{t('SignupPage.ConfirmPassword', null, 'Confirm Password *')}</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    className="input-field w-full pr-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('SignupPage.ConfirmPasswordPh', null, 'Confirm your password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
              >
                {loading ? t('SignupPage.CreatingAccount', null, 'Creating account...') : t('SignupPage.SignUpBtn', null, 'Sign Up')}
              </button>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">{t('SignupPage.OrContinueWith', null, 'Or continue with')}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                >
                  <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                  {t('SignupPage.GoogleSignIn', null, 'Google')}
                </button>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600 mt-4">
              {t('SignupPage.AlreadyHaveAccount', null, 'Already have an account?')} <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">{t('SignupPage.SignIn', null, 'Sign in')}</Link>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Mobile Prompt Modal for Google Sign-up */}
      {showMobilePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
          >
            <h3 className="text-xl font-bold text-gray-900 text-center">{t('SignupPage.AlmostThere', null, 'Almost there!')}</h3>
            <p className="text-sm text-gray-600 text-center">
              {t('SignupPage.MobilePromptDesc', null, 'Please provide your mobile number to complete your registration. We need this for order deliveries.')}
            </p>
            <form onSubmit={handleGoogleMobileSubmit} className="space-y-4 mt-4">
              {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('SignupPage.MobileNumber', null, 'Mobile Number')}</label>
                <input
                  type="tel"
                  required
                  className="input-field w-full"
                  value={googleMobile}
                  onChange={(e) => setGoogleMobile(e.target.value)}
                  placeholder={t('SignupPage.MobilePh', null, '10-digit mobile number')}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMobilePrompt(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-colors"
                >
                  {t('SignupPage.Cancel', null, 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
                >
                  {loading ? t('SignupPage.Saving', null, 'Saving...') : t('SignupPage.Complete', null, 'Complete')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Signup;
