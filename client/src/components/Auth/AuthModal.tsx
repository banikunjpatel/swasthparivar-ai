// src/components/AuthModal.tsx
import React, { useState } from "react";
import { AlertCircle, CheckCircle, X } from 'lucide-react';

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "./firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();
  const [success, setSuccess] = useState('');

  if (!open) return null;

  // 🔹 Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const isNewUser = (result as any)?._tokenResponse?.isNewUser ?? false;
      if (isNewUser) {
        signUpWithFirebase(result.user, token);
      } else {
        signInWithFirebase(result.user, token);
      }

      onClose();
      resetForm()
    } catch (err: any) {
      console.error(err);
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setSuccess('');
  };

  // 🔹 Email/Password Sign-In or Sign-Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        signInWithFirebase(userCredential.user, await userCredential.user.getIdToken());
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await userCredential.user.getIdToken();
        signUpWithFirebase(user, idToken);
        await sendEmailVerification(userCredential.user);
        setSuccess("Verification email sent!");
      }
      onClose();
      resetForm();
    } catch (err: any) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseError = (error: any) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        setError("This email is already registered. Try signing in instead.");
        break;
      case "auth/invalid-email":
        setError("Please enter a valid email address.");
        break;
      case "auth/weak-password":
        setError("Your password is too weak. Please use a stronger one.");
        break;
      case "auth/user-not-found":
        setError("No account found with this email. Try signing up.");
        break;
      case "auth/wrong-password":
        setError("Incorrect password. Try again.");
        break;
      default:
        setError("Something went wrong. Please try again later.");
        console.error(error);
    }
  }

  const signUpWithFirebase = async (user: any, idToken: string) => {
    let result;
    localStorage.setItem('accessToken', idToken)
    const payload = {
      uid: user.uid,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      createdAt: user.metadata.creationTime,
      emailVerified: user.emailVerified,
    };
    result = await signUp(payload);
    if (!result.error) {
      setSuccess('Account created! Now please log in to access your Swasth Parivar dashboard.');
    }
    return result
  }

  const signInWithFirebase = async (user: any, token: string) => {
    let result;
    const payload = {
      uid: user.uid,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      createdAt: user.metadata.creationTime,
      emailVerified: user.emailVerified,
    };
    result = await signIn(payload, token);
    if (!result.error) {
      setSuccess('Account created! Now please log in to access your Swasth Parivar dashboard.');
    }
    return result
  }

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
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

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
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-gray-100 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>

        <p className="text-center text-sm mt-4">
          {isLogin ? "New to Swasth Parivar?" : "Already user of Swasth Parivar?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-600 ml-1 hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>

      </div>
    </div>
  );
};

export default AuthModal;

// import React, { useState } from 'react';
// import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';

// interface AuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   hasLogin?: boolean;
// }

// const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, hasLogin }) => {
//   const [isLogin, setIsLogin] = useState(() => hasLogin === true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [name, setName] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
//   const { signIn, signUp } = useAuth();

//   const validateFields = () => {
//     const newErrors: { [key: string]: string } = {};

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }

//     if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,10}$/.test(password)) {
//       newErrors.password = 'Password must be 8-10 characters with uppercase, lowercase, number, and special character';
//     }

//     if (!isLogin && password !== confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     if (!isLogin && name.trim().length === 0) {
//       newErrors.name = 'Full name is required';
//     }

//     setFieldErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (!validateFields()) return;

//     setLoading(true);
//     try {
//       let result;
//       if (isLogin) {
// result = await signIn(email, password);
//         if (!result.error) {
//           setSuccess('Welcome back! Redirecting to your dashboard...');
//         }
//       } else {
//         result = await signUp({ name, email, password });
//         if (!result.error) {
//           setSuccess('Account created! Now please log in to access your Swasth Parivar dashboard.');
//         }
//       }

//       if (result.error) {
//         setError(result.error);
//       } else {
//         setTimeout(() => {
//           if (isLogin) {
//             onClose();
//           } else {
//             setIsLogin(true);
//           }

//           resetForm();
//         }, 2000);
//       }
//     } catch (err: any) {
//       setError(err.message || 'An unexpected error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };
//   const resetForm = () => {
//     setIsLogin(true);
//     setEmail('');
//     setPassword('');
//     setName('');
//     setError('');
//     setSuccess('');
//     setShowPassword(false);
//     setFieldErrors({ name: '', email: '', password: '', confirmPassword: '' });
//   };

//   const switchMode = () => {
//     resetForm();
//     setIsLogin(!isLogin);
//     console.log('Switching mode:', isLogin ? 'to Sign Up' : 'to Sign In');

//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl">🧘‍♀️</span>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800">
//             {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
//           </h2>
//           <p className="text-gray-600 mt-2">
//             {isLogin
//               ? 'Continue your Ayurvedic wellness journey'
//               : 'Discover personalized nutrition for your unique constitution'
//             }
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {!isLogin && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => {
//                     setName(e.target.value);
//                     if (e.target.value.trim()) setFieldErrors(prev => ({ ...prev, name: '' }));
//                   }}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//                   placeholder="Enter your full name"
//                   required={!isLogin}
//                 />
//               </div>
//               {fieldErrors.name && (
//                 <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
//               )}
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => {
//                   setEmail(e.target.value);
//                   if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
//                     setFieldErrors(prev => ({ ...prev, email: '' }));
//                   }
//                 }}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//                 placeholder="Enter your email"
//                 required
//               />

//             </div>
//             {fieldErrors.email && (
//               <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => {
//                   setPassword(e.target.value);
//                   if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,10}$/.test(e.target.value)) {
//                     setFieldErrors(prev => ({ ...prev, password: '' }));
//                   }
//                 }}
//                 className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//                 placeholder={isLogin ? "Enter your password" : "Create a strong password"}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//               </button>
//             </div>
//             {fieldErrors.password && (
//               <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
//             )}
//           </div>
//           <>{!isLogin && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Confirm Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={confirmPassword}
//                   onChange={(e) => {
//                     setConfirmPassword(e.target.value);
//                     if (e.target.value === password) {
//                       setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
//                     }
//                   }}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//                   placeholder="Re-enter your password"
//                   required
//                 />
//               </div>
//               {fieldErrors.confirmPassword && (
//                 <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
//               )}
//             </div>
//           )}</>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//               <div className="flex items-start space-x-2">
//                 <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-red-600 text-sm">{error}</p>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//               <div className="flex items-start space-x-2">
//                 <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-green-600 text-sm">{success}</p>
//               </div>
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center space-x-2">
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 <span>Please wait...</span>
//               </div>
//             ) : (
//               isLogin ? 'Sign In' : 'Create Account'
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             {isLogin ? "New to Swasth Pariwar?" : 'Already have an account?'}
//             <button
//               onClick={switchMode}
//               className="ml-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
//             >
//               {isLogin ? 'Create Account' : 'Sign In'}
//             </button>
//           </p>
//         </div>

//         {/* Cultural Context */}
//         <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
//           <div className="text-center">
//             <p className="text-sm text-gray-700 mb-2">
//               <span className="font-semibold">🌿 Ancient Wisdom, Modern Science</span>
//             </p>
//             <p className="text-xs text-gray-600">
//               Personalized wellness based on your Ayurvedic constitution
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthModal;



// import React, { useState } from 'react';
// import { X, Phone, Lock, CheckCircle, AlertCircle } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';

// interface AuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   hasLogin?: boolean;
// }

// const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, hasLogin }) => {
//   const [isLogin, setIsLogin] = useState(() => hasLogin === true);
//   const [phone, setPhone] = useState('');
//   const [otp, setOtp] = useState('');
//   const [serverOtp, setServerOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//    const { sendSMS } = useAuth();

//   if (!isOpen) return null;

//   const handleSendOtp = async () => {
//     setError('');
//     setSuccess('');

//     if (!/^[6-9]\d{9}$/.test(phone)) {
//       setError('Please enter a valid 10-digit Indian mobile number');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Send OTP via your Python backend (MSG91 integration)
//        let res;
//       res = await sendSMS(phone);
//       console.log('OTP send response:', res);
//       // if (res.data.success) {
//       //   // You can store generated OTP locally for demo (in real app verify via backend)
//       //   const generatedOtp = res.otp || '123456'; // simulate
//       //   setServerOtp(generatedOtp);
//       //   setOtpSent(true);
//       //   setSuccess('OTP sent successfully to your phone.');
//       // }
//     } catch (err: any) {
//       setError('Failed to send OTP. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOtp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (otp.trim().length !== 6) {
//       setError('Please enter a 6-digit OTP');
//       return;
//     }

//     setLoading(true);
//     try {
//       if (otp === serverOtp || otp === '123456') {
//         setSuccess(isLogin ? 'Welcome back!' : 'Registration successful!');
//         setTimeout(() => {
//           onClose();
//           resetForm();
//         }, 2000);
//       } else {
//         setError('Invalid OTP. Please check and try again.');
//       }
//     } catch (err: any) {
//       setError('Verification failed. Please retry.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setPhone('');
//     setOtp('');
//     setServerOtp('');
//     setError('');
//     setSuccess('');
//     setOtpSent(false);
//   };

//   const switchMode = () => {
//     resetForm();
//     setIsLogin(!isLogin);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl">🌿</span>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800">
//             {isLogin ? 'Welcome Back' : 'Join Swasth Parivar'}
//           </h2>
//           <p className="text-gray-600 mt-2">
//             {isLogin
//               ? 'Log in with your registered mobile number'
//               : 'Register using your mobile number to continue'}
//           </p>
//         </div>

//         <form onSubmit={handleVerifyOtp} className="space-y-6">
//           {/* Phone Input */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//               <input
//                 type="text"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 maxLength={10}
//                 disabled={otpSent}
//                 placeholder="Enter 10-digit mobile number"
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//                 required
//               />
//             </div>
//           </div>

//           {/* Send OTP / Resend */}
//           {!otpSent && (
//             <button
//               type="button"
//               onClick={handleSendOtp}
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50"
//             >
//               {loading ? 'Sending OTP...' : 'Send OTP'}
//             </button>
//           )}

//           {/* OTP Input */}
//           {otpSent && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                   <input
//                     type="text"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     maxLength={6}
//                     placeholder="6-digit OTP"
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//                     required
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50"
//               >
//                 {loading ? 'Verifying...' : isLogin ? 'Login' : 'Register'}
//               </button>

//               <div className="text-right mt-2">
//                 <button
//                   type="button"
//                   onClick={handleSendOtp}
//                   className="text-sm text-green-600 hover:text-green-700"
//                 >
//                   Resend OTP
//                 </button>
//               </div>
//             </>
//           )}

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//               <div className="flex items-start space-x-2">
//                 <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-red-600 text-sm">{error}</p>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//               <div className="flex items-start space-x-2">
//                 <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-green-600 text-sm">{success}</p>
//               </div>
//             </div>
//           )}
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             {isLogin ? "New user?" : 'Already registered?'}
//             <button
//               onClick={switchMode}
//               className="ml-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
//             >
//               {isLogin ? 'Register' : 'Login'}
//             </button>
//           </p>
//         </div>

//         <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
//           <div className="text-center">
//             <p className="text-sm text-gray-700 mb-2 font-semibold">
//               🌱 Ayurveda meets Technology
//             </p>
//             <p className="text-xs text-gray-600">
//               Experience balanced wellness with Swasth Parivar
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthModal;
