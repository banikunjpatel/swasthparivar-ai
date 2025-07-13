import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasLogin?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, hasLogin }) => {
  const [isLogin, setIsLogin] = useState(() => hasLogin === true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { signIn, signUp } = useAuth();

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,10}$/.test(password)) {
      newErrors.password = 'Password must be 8-10 characters with uppercase, lowercase, number, and special character';
    }

    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!isLogin && name.trim().length === 0) {
      newErrors.name = 'Full name is required';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateFields()) return;

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
        if (!result.error) {
          setSuccess('Welcome back! Redirecting to your dashboard...');
        }
      } else {
        result = await signUp({ name, email, password });
        if (!result.error) {
          setSuccess('Account created! Now please log in to access your Swasth Parivar dashboard.');
        }
      }

      if (result.error) {
        setError(result.error);
      } else {
        setTimeout(() => {
          if (isLogin) {
            onClose();
          } else {
            setIsLogin(true);
          }

          resetForm();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setIsLogin(true);
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
    setShowPassword(false);
    setFieldErrors({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const switchMode = () => {
    resetForm();
    setIsLogin(!isLogin);
    console.log('Switching mode:', isLogin ? 'to Sign Up' : 'to Sign In');

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧘‍♀️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin
              ? 'Continue your Ayurvedic wellness journey'
              : 'Discover personalized nutrition for your unique constitution'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setFieldErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                required
              />

            </div>
            {fieldErrors.email && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,10}$/.test(e.target.value)) {
                    setFieldErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
            )}
          </div>
          <>{!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (e.target.value === password) {
                      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          )}</>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Please wait...</span>
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "New to Swasth Pariwar?" : 'Already have an account?'}
            <button
              onClick={switchMode}
              className="ml-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Cultural Context */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">🌿 Ancient Wisdom, Modern Science</span>
            </p>
            <p className="text-xs text-gray-600">
              Personalized wellness based on your Ayurvedic constitution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;