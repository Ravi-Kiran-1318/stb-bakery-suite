import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading: authLoading, firebaseLoginAction, completeGoogleSignupAction } = useAuth(); // rename loading to authLoading from context

  // Google auth states
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState('');
  const [googleMobile, setGoogleMobile] = useState('');
  // Phone auth states
  const [isPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

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

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setupRecaptcha();
      // Assume Indian number for simplicity if 10 digits
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP. Try again.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      const loggedInUser = await firebaseLoginAction(idToken);

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
      console.error(err);
      setError('Invalid OTP or login failed');
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
        if (redirect) navigate(redirect);
        else navigate(response.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
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
      if (redirect) navigate(redirect);
      else navigate(loggedInUser.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration');
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

          {/* Temporarily hidden to save SMS costs
          <div className="flex justify-center space-x-4 mt-6 border-b pb-4">
            <button
              className={`text-sm font-semibold pb-1 border-b-2 ${!isPhoneLogin ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setIsPhoneLogin(false); setError(''); }}
            >
              Email / Password
            </button>
            <button
              className={`text-sm font-semibold pb-1 border-b-2 ${isPhoneLogin ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setIsPhoneLogin(true); setError(''); }}
            >
              Phone Login (OTP)
            </button>
          </div>
          */}

          {!isPhoneLogin ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Number (or) Email</label>
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
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="input-field w-full pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={showOtpInput ? handleOtpSubmit : handlePhoneSubmit}>
              <div id="recaptcha-container"></div>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {!showOtpInput ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      className="input-field mt-1"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">6-Digit OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="input-field mt-1 tracking-widest text-center text-xl font-bold"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="------"
                    />
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
                >
                  {loading ? 'Processing...' : (showOtpInput ? 'Verify OTP & Login' : 'Send OTP')}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
              >
                <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                Google
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account? <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-semibold">Sign up</Link>
          </div>
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
            <h3 className="text-xl font-bold text-gray-900 text-center">Almost there!</h3>
            <p className="text-sm text-gray-600 text-center">
              Please provide your mobile number to complete your registration. We need this for order deliveries.
            </p>
            <form onSubmit={handleGoogleMobileSubmit} className="space-y-4 mt-4">
              {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  className="input-field w-full"
                  value={googleMobile}
                  onChange={(e) => setGoogleMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMobilePrompt(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
                >
                  {loading ? 'Saving...' : 'Complete'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Login;
