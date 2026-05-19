// // src/components/AuthModal.tsx
// import React, { useState } from "react";
// import { AlertCircle, CheckCircle, X } from 'lucide-react';

// import {
//   signInWithPopup,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
// } from "firebase/auth";
// import { auth, googleProvider } from "./firebaseConfig";
// import { useAuth } from "../../contexts/AuthContext";

// interface AuthModalProps {
//   open: boolean;
//   onClose: () => void;
// }

// const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { signIn, signUp } = useAuth();
//   const [success, setSuccess] = useState('');

//   if (!open) return null;

//   // 🔹 Google Sign-In
//   const handleGoogleLogin = async () => {
//     try {
//       setLoading(true);
//       const result = await signInWithPopup(auth, googleProvider);
//       const token = await result.user.getIdToken();
//       const isNewUser = (result as any)?._tokenResponse?.isNewUser ?? false;
//       if (isNewUser) {
//         signUpWithFirebase(result.user, token);
//       } else {
//         signInWithFirebase(result.user, token);
//       }

//       onClose();
//       resetForm()
//     } catch (err: any) {
//       console.error(err);
//       handleFirebaseError(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setError('');
//     setSuccess('');
//   };

//   // 🔹 Email/Password Sign-In or Sign-Up
//   const handleEmailAuth = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       let userCredential;
//       if (isLogin) {
//         userCredential = await signInWithEmailAndPassword(auth, email, password);
//         signInWithFirebase(userCredential.user, await userCredential.user.getIdToken());
//       } else {
//         userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         const idToken = await userCredential.user.getIdToken();
//         signUpWithFirebase(user, idToken);
//         await sendEmailVerification(userCredential.user);
//         setSuccess("Verification email sent!");
//       }
//       onClose();
//       resetForm();
//     } catch (err: any) {
//       handleFirebaseError(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFirebaseError = (error: any) => {
//     switch (error.code) {
//       case "auth/email-already-in-use":
//         setError("This email is already registered. Try signing in instead.");
//         break;
//       case "auth/invalid-email":
//         setError("Please enter a valid email address.");
//         break;
//       case "auth/weak-password":
//         setError("Your password is too weak. Please use a stronger one.");
//         break;
//       case "auth/user-not-found":
//         setError("No account found with this email. Try signing up.");
//         break;
//       case "auth/wrong-password":
//         setError("Incorrect password. Try again.");
//         break;
//       default:
//         setError("Something went wrong. Please try again later.");
//         console.error(error);
//     }
//   }

//   const signUpWithFirebase = async (user: any, idToken: string) => {
//     let result;
//     localStorage.setItem('accessToken', idToken)
//     const payload = {
//       uid: user.uid,
//       email: user.email,
//       phoneNumber: user.phoneNumber || "",
//       createdAt: user.metadata.creationTime,
//       emailVerified: user.emailVerified,
//     };
//     result = await signUp(payload);
//     if (!result.error) {
//       setSuccess('Account created! Now please log in to access your Swasth Parivar dashboard.');
//     }
//     return result
//   }

//   const signInWithFirebase = async (user: any, token: string) => {
//     let result;
//     const payload = {
//       uid: user.uid,
//       email: user.email,
//       phoneNumber: user.phoneNumber || "",
//       createdAt: user.metadata.creationTime,
//       emailVerified: user.emailVerified,
//     };
//     result = await signIn(payload, token);
//     if (!result.error) {
//       setSuccess('Account created! Now please log in to access your Swasth Parivar dashboard.');
//     }
//     return result
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
//         <button
//           onClick={() => {
//             onClose();
//             resetForm();
//           }}
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
//         <h2 className="text-2xl font-semibold text-center mb-6">
//           {isLogin ? "Sign In" : "Create Account"}
//         </h2>

//         <form onSubmit={handleEmailAuth} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full border rounded-lg px-4 py-2"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full border rounded-lg px-4 py-2"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

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
//             className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
//           >
//             {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
//           </button>
//         </form>

//         <div className="mt-4 text-center">
//           <button
//             onClick={handleGoogleLogin}
//             className="w-full bg-gray-100 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
//           >
//             <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
//             Sign in with Google
//           </button>
//         </div>

//         <p className="text-center text-sm mt-4">
//           {isLogin ? "New to Swasth Parivar?" : "Already user of Swasth Parivar?"}
//           <button
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-green-600 ml-1 hover:underline"
//           >
//             {isLogin ? "Sign up" : "Login"}
//           </button>
//         </p>

//       </div>
//     </div>
//   );
// };

// export default AuthModal;


// src/components/AuthModal.tsx
import React, { useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import { getCurrentSeason } from "../../utils/ayurvedic-logic";
import SetPasswordModal from "./SetPasswordModal";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [useOtp, setUseOtp] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [googleFirebaseUser, setGoogleFirebaseUser] = useState<User | null>(null);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { signIn, signUp } = useAuth();

  // Stay mounted while set-password prompt is active even if parent closed the auth modal
  if (!open && !setPasswordOpen) return null;

  // ---------- Helpers ----------
  const resetForm = () => {
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setPhone("");
    setOtp("");
    setConfirmationResult(null);
    setUseOtp(false);
    setForgotMode(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setForgotError('');
  };

  const handleFirebaseError = (err: any) => {
    if (!err || !err.code) {
      setError("Something went wrong. Please try again.");
      return;
    }
    switch (err.code) {
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
        setError("No account found with this email address. Please check and try again, or sign up.");
        break;
      case "auth/wrong-password":
        setError("Incorrect password. Please double-check your password and try again.");
        break;
      case "auth/invalid-credential":
        setError("The email or password you entered is incorrect. Please try again.");
        break;
      case "auth/too-many-requests":
        setError("Too many failed attempts. Please wait a few minutes and try again.");
        break;
      default:
        setError(err.message || "Authentication failed. Please try again.");
    }
  };

  // ---------- Forgot password ----------
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) { setForgotError('Please enter your email address.'); return; }
    setForgotLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, forgotEmail.trim());
      if (methods.length > 0 && !methods.includes('password') && methods.includes('google.com')) {
        setForgotError(
          'This account uses Google Sign-In only. Please sign in with Google, then set a password from your profile menu (top-right corner).'
        );
        setForgotLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setForgotError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setForgotError('Please enter a valid email address.');
      } else {
        setForgotError(err.message || 'Failed to send reset email. Try again.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // ---------- Google sign in ----------
  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const payload = {
        idToken: token,
        uid: result.user.uid,
        name: result.user.displayName || "",
        email: result.user.email,
        phoneNumber: result.user.phoneNumber || "",
        createdAt: result.user.metadata.creationTime,
        emailVerified: result.user.emailVerified,
        season: getCurrentSeason(),
      };

      // Try login first — only register if the user doesn't exist yet
      let res = await signIn(payload, token);

      if (res?.error) {
        // User not found → register then login
        const regRes = await signUp(payload);
        if (regRes?.error) {
          setError(regRes.error || "Registration failed. Please try again.");
          return;
        }
        res = await signIn(payload, token);
      }

      if (res?.error) {
        setError(res.error || "Login failed. Please try again.");
      } else {
        const hasPassword = result.user.providerData.some(
          (p) => p.providerId === 'password'
        );
        if (!hasPassword) {
          setGoogleFirebaseUser(result.user);
          setSetPasswordOpen(true);
        } else {
          setSuccess("Login successful!");
          setTimeout(() => { onClose(); resetForm(); }, 800);
        }
      }
    } catch (err: any) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Email / Password ----------
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      let userCredential: any;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        const payload = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          phoneNumber: userCredential.user.phoneNumber || "",
          createdAt: userCredential.user.metadata.creationTime,
          emailVerified: userCredential.user.emailVerified,
        };
        const res = await signIn(payload, idToken);
        if (res?.error) {
          setError(res.error || "Login failed. Please try again.");
        } else {
          setSuccess("Login successful!");
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1000);
        }
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Send verification email
        await sendEmailVerification(userCredential.user);
        // Call backend signup (your backend expects signup flow)
        const idToken = await userCredential.user.getIdToken();
        const payload = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          phoneNumber: userCredential.user.phoneNumber || "",
          createdAt: userCredential.user.metadata.creationTime,
          emailVerified: userCredential.user.emailVerified,
        };
        const res = await signUp(payload);
        if (res?.error) {
          setError(res.error || "Signup failed. Please try again.");
        } else {
          setSuccess("Account created! Verification email sent. Please verify and then login.");
          // keep modal open so user can login after verification
        }
      }
    } catch (err: any) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Phone OTP (Option B: OTP login only) ----------
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
    return (window as any).recaptchaVerifier;
  };

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    try {
      // setupRecaptcha();
      const appVerifier = setupRecaptcha();
      const fullPhone = `+91${phone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      //  const appVerifier = setupRecaptcha();
      // const fullPhone = `+91${phone}`;
      // const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(confirmationResult);
      setSuccess("OTP sent successfully to your phone.");
    } catch (err: any) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    if (!confirmationResult) {
      setError("Please request OTP first.");
      return;
    }
    if (!otp || otp.trim().length < 4) {
      setError("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Build payload for backend signIn (Option B: do not auto-signup)
      const payload = {
        uid: result.user.uid,
        email: result.user.email || "",
        phoneNumber: result.user.phoneNumber || "",
        createdAt: result.user.metadata?.creationTime || "",
        emailVerified: result.user.emailVerified || false,
      };

      const res = await signIn(payload, idToken);

      if (res?.error) {
        // If backend returns a user-not-found style error, inform user to use email signup
        // We assume backend returns consistent error messages in res.error
        setError(
          res.error ||
          "No account associated with this phone number. Please sign up using Email & Password."
        );
      } else {
        setSuccess("Login successful!");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      }
    } catch (err: any) {
      // Firebase errors like auth/invalid-verification-code
      if (err?.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please try again.");
      } else {
        setError(err?.message || "OTP verification failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <>
      {open && !setPasswordOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧘‍♀️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? "Welcome Back" : "Begin Your Journey"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin
                ? "Continue your natural living journey"
                : "Discover personalized nutrition for your unique nature"}
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-center mb-6">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>

          {/* Form */}
          <form
            onSubmit={useOtp ? handleVerifyOtp : handleEmailAuth}
            className="space-y-4"
          >
            {/* Toggle between Email and OTP 
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => {
                setUseOtp(false);
                setError("");
                setSuccess("");
              }}
              className={`px-3 py-1 rounded-full border ${
                !useOtp ? "bg-green-50 border-green-300" : "bg-white border-gray-200"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setUseOtp(true);
                setError("");
                setSuccess("");
              }}
              className={`px-3 py-1 rounded-full border ${
                useOtp ? "bg-green-50 border-green-300" : "bg-white border-gray-200"
              }`}
            >
              Mobile (OTP)
            </button>
          </div>*/}

            {useOtp ? (
              <>
                {/* PHONE */}
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  className="w-full border rounded-lg px-4 py-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                />

                {confirmationResult ? (
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="w-full border rounded-lg px-4 py-2"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                  />
                ) : null}

                {!confirmationResult ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                )}
              </>
            ) : (
              <>
                {/* EMAIL / PASSWORD */}
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border rounded-lg px-4 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full border rounded-lg px-4 py-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setForgotEmail(email); setForgotError(''); setForgotSuccess(false); }}
                      className="mt-1.5 text-xs text-green-600 hover:underline float-right"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
                </button>
              </>
            )}
          </form>

          {/* status messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* ── Forgot-password panel (overlays the modal content) ── */}
          {forgotMode && (
            <div className="absolute inset-0 bg-white rounded-2xl z-10 flex flex-col p-8">
              {forgotSuccess ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">Check your inbox</h3>
                  <p className="text-gray-500 text-sm mb-1">
                    We sent a password reset link to
                  </p>
                  <p className="font-semibold text-gray-700 text-sm mb-6">{forgotEmail}</p>
                  <button
                    onClick={() => setForgotMode(false)}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setForgotMode(false)}
                      className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    >
                      ←
                    </button>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Reset Password</h3>
                      <p className="text-gray-500 text-xs mt-0.5">We'll email you a reset link</p>
                    </div>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-4 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        required
                        autoFocus
                      />
                    </div>
                    {forgotError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-600 text-xs">{forgotError}</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-2.5 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition disabled:opacity-60"
                    >
                      {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Google Sign-in */}
          <div className="mt-4 text-center">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-gray-100 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </button>
          </div>

          <p className="text-center text-sm mt-4">
            {isLogin ? "New to Prakriti Parivar?" : "Already user of Prakriti Parivar?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-green-600 ml-1 hover:underline"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>

          {/* recaptcha container */}


          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-2 font-semibold">🌿 Ancient Wisdom, Natural Living</p>
              <p className="text-xs text-gray-600">Guidance rooted in your family's true nature</p>
            </div>
          </div>
        </div>
        <div id="recaptcha-container" />
      </div>}

      {/* Set-password prompt shown after Google sign-in */}
      <SetPasswordModal
        open={setPasswordOpen}
        firebaseUser={googleFirebaseUser}
        onClose={() => {
          setSetPasswordOpen(false);
          setGoogleFirebaseUser(null);
          onClose();
          resetForm();
        }}
      />
    </>
  );
};

export default AuthModal;

